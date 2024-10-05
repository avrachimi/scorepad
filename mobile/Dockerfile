# pull base image
FROM node:18-slim

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG EXPO_PUBLIC_API_ENDPOINT=https://scorepad.general.avrachimi.com
ENV EXPO_PUBLIC_API_ENDPOINT=$EXPO_PUBLIC_API_ENDPOINT

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy your project files into the container
COPY package*.json ./
RUN npm install --silent

COPY . .

# Step 5: Expose the ports used by Expo
EXPOSE 19000 19001 19002

# Step 6: Start the Expo development server using the `--tunnel` option for remote access
RUN npx expo start
