const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Safe Anchor API',
      version: '1.0.0',
      description: 'API documentation for Safe Anchor Backend'
    },
    servers: [
      { url: 'http://localhost:5000' }
    ]
  },
  apis: ['./routes/api/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};