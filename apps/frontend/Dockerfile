# Dockerfile for Frontend Service (React/Vite Dev Server)

# Use a specific Node version (adjust as needed, e.g., 18, 20)
FROM node:20-alpine AS development

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies (Choose based on your package manager)
# NPM:
# RUN npm install
# Yarn:
RUN yarn install --frozen-lockfile
# PNPM:
# RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
# Note: In docker-compose, we mount the volume, so this copy isn't strictly
# necessary for dev, but good practice for potentially building without compose.
COPY . .

# Expose the Vite default port (adjust if different)
EXPOSE 5173

# Command to run the Vite dev server
# The `--host` flag is important to expose the server outside the container
# NPM:
# CMD ["npm", "run", "dev", "--", "--host"]
# Yarn:
CMD ["yarn", "dev", "--host"]
# PNPM:
# CMD ["pnpm", "dev", "--host"]

# --- Build Stage (Optional - Can be kept for multi-stage builds if needed later) ---
# FROM node:18-alpine AS build
# WORKDIR /app
# COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
# RUN yarn install --frozen-lockfile
# COPY . .
# RUN yarn build

# --- Production Stage (Removed - Not using Nginx) ---
# FROM nginx:1.25-alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"] 