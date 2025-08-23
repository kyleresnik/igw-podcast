import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rssRoutes from './routes/rss';

// express server configuration and initialization
class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000', 10);
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  // configure middleware - security, logging, and parsing
  private initializeMiddleware(): void {
    // security middleware
    this.app.use(helmet());

    // cors configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      })
    );

    // compression and logging
    this.app.use(compression());
    this.app.use(morgan('combined'));

    // body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  // initialize api routes
  private initializeRoutes(): void {
    // health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
      });
    });

    // rss feed routes
    this.app.use('/api/rss', rssRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        timestamp: new Date().toISOString(),
      });
    });
  }

  // start the server
  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
      console.log(`RSS API available at http://localhost:${this.port}/api/rss`);
    });
  }
}

// initialize and start server
const server = new Server();
server.start();

export default Server;
