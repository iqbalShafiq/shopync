
<div align="center">
  <h1>🛍️ Shopync</h1>
  <p><i>A modern e-commerce backend built with ElysiaJS</i></p>

  <p>
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#features">Features</a> •
    <a href="#prerequisites">Prerequisites</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#api-endpoints">API Endpoints</a> •
    <a href="#future-enhancements">Future Enhancements</a>
  </p>
</div>

<div id="about">
  <h2>📝 About</h2>
  <p>
    Shopync is an e-commerce backend project developed as part of the Devscale Indonesia cohort submission. It provides essential e-commerce functionalities with a focus on clean architecture and modern TypeScript practices. Built with Bun and ElysiaJS for optimal performance and developer experience.
  </p>
</div>

<div id="tech-stack">
  <h2>🛠️ Tech Stack</h2>
  <p align="center">
    <img src="https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white" alt="Bun"/>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Elysia-000000?style=for-the-badge" alt="ElysiaJS"/>
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"/>
    <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/>
  </p>

  <ul>
    <li>🚀 <strong>Bun</strong> - All-in-one JavaScript runtime & toolkit</li>
    <li>🎯 <strong>ElysiaJS</strong> - Fast and type-safe Bun web framework</li>
    <li>📊 <strong>Prisma</strong> - Modern database ORM</li>
    <li>🗄️ <strong>SQLite</strong> - Lightweight, serverless database</li>
    <li>📘 <strong>TypeScript</strong> - For type safety and better developer experience</li>
  </ul>
</div>

<div id="features">
  <h2>✨ Features</h2>
  
  <h3>🔐 User Authentication</h3>
  <ul>
    <li>User registration with email and password</li>
    <li>User login with JWT token authentication</li>
    <li>Protected routes for authenticated users</li>
  </ul>

  <h3>📦 Product Management</h3>
  <ul>
    <li>Create new products with details (name, description, price, etc.)</li>
    <li>Update existing product information</li>
    <li>Delete products from inventory</li>
    <li>View all products with pagination</li>
    <li>Product categorization</li>
  </ul>

  <h3>🛒 Shopping Cart</h3>
  <ul>
    <li>Add products to personal shopping cart</li>
    <li>Update product quantities in cart</li>
    <li>Remove items from cart</li>
    <li>View cart total and item summary</li>
  </ul>
</div>

<div id="prerequisites">
  <h2>📋 Prerequisites</h2>
  <ul>
    <li>Bun ≥ 1.1.36</li>
  </ul>
</div>

<div id="getting-started">
  <h2>🚀 Getting Started</h2>

  ```bash
  # Clone the repository
  git clone https://github.com/iqbalShafiq/shopync.git

  # Navigate to the project directory
  cd shopync

  # Install dependencies
  bun install

  # Run database migrations
  bunx prisma migrate dev

  # Start the development server
  bun dev
  ```
</div>

<div id="api-endpoints">
  <h2>🔌 API Endpoints</h2>
  <p>Base URL: <code>http://localhost:8000</code></p>

  <h3>Authentication</h3>
  <table>
    <thead>
      <tr>
        <th>Method</th>
        <th>Endpoint</th>
        <th>Description</th>
        <th>Auth Required</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>POST</code></td>
        <td><code>/auth/register</code></td>
        <td>Register new user</td>
        <td>No</td>
      </tr>
      <tr>
        <td><code>POST</code></td>
        <td><code>/auth/login</code></td>
        <td>Login user</td>
        <td>No</td>
      </tr>
    </tbody>
  </table>

  <h3>Products</h3>
  <table>
    <thead>
      <tr>
        <th>Method</th>
        <th>Endpoint</th>
        <th>Description</th>
        <th>Auth Required</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>GET</code></td>
        <td><code>/products</code></td>
        <td>Get all products</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td><code>GET</code></td>
        <td><code>/products/:id</code></td>
        <td>Get product by ID</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td><code>POST</code></td>
        <td><code>/products</code></td>
        <td>Create new product</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td><code>PUT</code></td>
        <td><code>/products/:id</code></td>
        <td>Update product</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td><code>DELETE</code></td>
        <td><code>/products/:id</code></td>
        <td>Delete product</td>
        <td>Yes</td>
      </tr>
    </tbody>
  </table>

  <h3>Cart</h3>
  <table>
    <thead>
      <tr>
        <th>Method</th>
        <th>Endpoint</th>
        <th>Description</th>
        <th>Auth Required</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>GET</code></td>
        <td><code>/cart</code></td>
        <td>Get user's cart</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td><code>POST</code></td>
        <td><code>/cart</code></td>
        <td>Upsert item to cart</td>
        <td>Yes</td>
      </tr>
    </tbody>
  </table>

  <h3>Categories</h3>
  <table>
    <thead>
      <tr>
        <th>Method</th>
        <th>Endpoint</th>
        <th>Description</th>
        <th>Auth Required</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>GET</code></td>
        <td><code>/categories</code></td>
        <td>Get all categories</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td><code>POST</code></td>
        <td><code>/categories</code></td>
        <td>Add new category</td>
        <td>Yes</td>
      </tr>
    </tbody>
  </table>
</div>

<div id="future-enhancements">
  <h2>🔮 Future Enhancements</h2>
  
  <h3>💳 Payment Integration</h3>
  <ul>
    <li>Integration with popular payment gateways</li>
    <li>Support for multiple payment methods</li>
    <li>Secure payment processing</li>
    <li>Payment history and transaction tracking</li>
  </ul>

  <h3>🚀 Platform Enhancement</h3>
  <ul>
    <li>Advanced product search and filtering</li>
    <li>Product reviews and ratings system</li>
    <li>User profile management</li>
    <li>Order tracking and history</li>
    <li>Admin dashboard for analytics</li>
  </ul>

  <h3>📱 Integration & Scaling</h3>
  <ul>
    <li>API rate limiting and caching</li>
    <li>Automated testing and CI/CD pipeline</li>
  </ul>
</div>

<div id="footer">
  <hr>

  <p align="left">
    Built with ❤️ by <a href="https://github.com/iqbalShafiq">Shafiq</a>
    <br>
    <sub>As part of Devscale Indonesia cohort submission</sub>
  </p>
</div>
