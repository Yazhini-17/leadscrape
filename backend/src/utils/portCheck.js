const net = require('net');
const { execSync } = require('child_process');

/**
 * Checks if a TCP port is in use by attempting to listen on it briefly.
 * @param {number} port
 * @returns {Promise<boolean>}
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        tester.close(() => resolve(false));
      })
      .listen(port);
  });
}

/**
 * Finds the PID and process name holding a specific TCP port.
 * Cross-platform: works on Windows, Linux, and macOS.
 * @param {number} port
 * @returns {{ pid: string|null, processName: string|null, killCommand: string|null }}
 */
function getProcessOnPort(port) {
  let pid = null;
  let processName = null;
  let killCommand = null;

  try {
    if (process.platform === 'win32') {
      // Use netstat on Windows
      const netstatOutput = execSync('netstat -ano -p tcp', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
        windowsHide: true,
      });

      const lines = netstatOutput.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('TCP') && trimmed.includes('LISTENING')) {
          const parts = trimmed.split(/\s+/);
          // Format: TCP [Local Address] [Foreign Address] [State] [PID]
          const localAddress = parts[1] || '';
          if (localAddress.endsWith(`:${port}`) || localAddress.endsWith(`]:${port}`)) {
            const candidatePid = parts[parts.length - 1];
            if (candidatePid && candidatePid !== '0' && candidatePid !== String(process.pid)) {
              pid = candidatePid;
              break;
            }
          }
        }
      }

      if (pid) {
        // Try to get process name with tasklist
        try {
          const tasklistOutput = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
            windowsHide: true,
          }).trim();

          // tasklist output in CSV format: "node.exe","11192","Console","1","102,432 K"
          if (tasklistOutput && !tasklistOutput.includes('No tasks')) {
            const taskLines = tasklistOutput.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            for (const taskLine of taskLines) {
              const match = taskLine.match(/^"([^"]+)"/);
              if (match && match[1]) {
                processName = match[1];
                break;
              }
            }
          }
        } catch {
          // Ignore tasklist failure
        }
        killCommand = `taskkill /PID ${pid} /F`;
      }
    } else {
      // Unix / macOS
      const lsofOutput = execSync(`lsof -ti :${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();

      if (lsofOutput) {
        const pids = lsofOutput.split('\n').map(p => p.trim()).filter(p => p && p !== String(process.pid));
        if (pids.length > 0) {
          pid = pids[0];
          try {
            processName = execSync(`ps -p ${pid} -o comm=`, {
              encoding: 'utf8',
              stdio: ['pipe', 'pipe', 'ignore'],
            }).trim();
          } catch {
            // Ignore ps failure
          }
          killCommand = `kill -9 ${pid}`;
        }
      }
    }
  } catch {
    // Ignore diagnostic command failure
  }

  return { pid, processName, killCommand };
}

/**
 * Checks if the process name corresponds to a Node.js process.
 * Matches 'node.exe', 'node', and variants across platforms.
 * @param {string|null} processName
 * @returns {boolean}
 */
function isNodeProcess(processName) {
  if (!processName || typeof processName !== 'string') return false;
  const clean = processName.trim().toLowerCase().replace(/^["']|["']$/g, '');
  const baseName = clean.split(/[/\\]/).pop();
  return baseName === 'node.exe' || baseName === 'node' || baseName.startsWith('node');
}

/**
 * Attempts to terminate a process by PID.
 * Cross-platform: taskkill on Windows, kill -9 on Unix/macOS.
 * @param {string|number} pid
 * @returns {boolean} true if command succeeded
 */
function killProcess(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F`, {
        stdio: ['pipe', 'pipe', 'ignore'],
        windowsHide: true,
      });
    } else {
      execSync(`kill -9 ${pid}`, {
        stdio: ['pipe', 'pipe', 'ignore'],
      });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper delay function.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Polls the port until it is released or timeout expires.
 * @param {number} port
 * @param {number} timeoutMs default 3000ms
 * @param {number} intervalMs default 200ms
 * @returns {Promise<boolean>} true if port was released, false if still in use after timeout
 */
async function waitForPortRelease(port, timeoutMs = 3000, intervalMs = 200) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    await sleep(intervalMs);
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if the port is already in use.
 * If occupied by a stale Node.js process, automatically terminates it,
 * verifies port release, logs an informative notice, and allows startup to proceed (returns false).
 * If occupied by an unrelated non-node process, logs a clear warning and prevents startup (returns true).
 *
 * @param {number} port
 * @returns {Promise<boolean>} true if port could NOT be freed (non-node or timeout), false if available
 */
async function checkPortAndWarn(port) {
  const inUse = await isPortInUse(port);
  if (!inUse) {
    return false;
  }

  const { pid, processName, killCommand } = getProcessOnPort(port);

  // Safety check: Only auto-kill if process is confirmed to be node.exe / node
  const isNode = isNodeProcess(processName);

  if (isNode && pid) {
    killProcess(pid);
    const released = await waitForPortRelease(port, 3000, 200);

    if (released) {
      console.log(`⚠ Port ${port} was in use by a stale process (${processName || 'node.exe'}, PID ${pid}) — killed it automatically. Starting fresh.`);
      return false; // Port is now free! Proceed with server startup.
    } else {
      console.error('\n================================================================');
      console.error(`✗ Port ${port} was in use by a stale process (${processName || 'node.exe'}, PID ${pid}).`);
      console.error(`  Automatic termination was attempted, but the port was not released within 3 seconds.`);
      if (killCommand) {
        console.error(`  To force free this port, run:`);
        console.error(`    ${killCommand}`);
      }
      console.error('================================================================\n');
      return true;
    }
  }

  // Unrelated application or unknown process holding the port — do NOT auto-kill
  const processInfo = pid
    ? `by ${processName ? `'${processName}' ` : ''}(PID: ${pid})`
    : 'by another process';

  console.error('\n================================================================');
  console.error(`✗ Port ${port} is already in use ${processInfo}.`);
  console.error(`  Auto-kill skipped: only stale 'node' processes are terminated automatically.`);
  console.error(`  Another instance or application may be running.`);
  if (killCommand) {
    console.error(`  To free this port, run:`);
    console.error(`    ${killCommand}`);
  }
  console.error(`  Or set a different PORT in backend/.env (e.g. PORT=8001)`);
  console.error(`  and update VITE_API_URL in frontend/.env accordingly.`);
  console.error('================================================================\n');

  return true;
}

module.exports = {
  isPortInUse,
  getProcessOnPort,
  isNodeProcess,
  killProcess,
  waitForPortRelease,
  checkPortAndWarn,
};
