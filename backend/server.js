const app = require('./src/app');
const config = require('./src/config/config');
const { sequelize } = require('./src/models');
const { checkPortAndWarn, getProcessOnPort } = require('./src/utils/portCheck');

async function startServer() {
  const port = config.PORT;

  // Pre-flight check: detect if target port is already occupied BEFORE connecting to DB or binding
  const portInUse = await checkPortAndWarn(port);
  if (portInUse) {
    process.exit(1);
  }

  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('✓ Connected to MySQL database successfully.');

    // Start listening on configured port
    const server = app.listen(port, () => {
      console.log(`✓ LeadScrape API server listening on http://localhost:${port}`);
      console.log(`✓ Environment: ${config.ENV}`);
    });

    // Handle port bind errors (e.g. EADDRINUSE if another process grabbed it in a race condition)
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const { pid, processName, killCommand } = getProcessOnPort(port);
        console.error('\n================================================================');
        console.error(`✗ Port ${port} is already in use — another instance may still be running. Stop it or set a different PORT in .env.`);
        if (pid) {
          console.error(`  Occupying process: ${processName || 'unknown'} (PID: ${pid})`);
        }
        if (killCommand) {
          console.error(`  To terminate it, run: ${killCommand}`);
        }
        console.error('================================================================\n');
        process.exit(1);
      } else {
        console.error('✗ Server failed with error:', err.message);
        process.exit(1);
      }
    });

    // Graceful shutdown handling
    let isShuttingDown = false;
    const gracefulShutdown = async (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.log(`\nReceived ${signal}. Shutting down server gracefully...`);

      // Safety timeout: force exit after 3 seconds if connections fail to close
      const forceExitTimer = setTimeout(() => {
        console.warn('! Forced shutdown: active connections did not close in time.');
        process.exit(0);
      }, 3000);
      forceExitTimer.unref();

      try {
        // Stop accepting new connections and close existing idle connections
        if (typeof server.closeIdleConnections === 'function') {
          server.closeIdleConnections();
        }

        await new Promise((resolve) => {
          server.close((closeErr) => {
            if (closeErr && closeErr.code !== 'ERR_SERVER_NOT_RUNNING') {
              console.error('! Error closing HTTP server:', closeErr.message);
            } else {
              console.log('✓ HTTP server closed.');
            }
            resolve();
          });
        });

        // Close MySQL database connection pool
        await sequelize.close();
        console.log('✓ Database connections closed. Goodbye!');
      } catch (err) {
        console.error('! Error during shutdown:', err.message);
      } finally {
        clearTimeout(forceExitTimer);
        if (signal === 'SIGUSR2') {
          // Allow nodemon to proceed with its restart
          process.kill(process.pid, 'SIGUSR2');
        } else {
          process.exit(0);
        }
      }
    };

    // Listen for termination signals
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.once('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

    // Handle unexpected runtime errors
    process.on('uncaughtException', (err) => {
      console.error('✗ Uncaught Exception:', err);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
    });
  } catch (err) {
    console.error('✗ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
