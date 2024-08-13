# Doctor Appointment Website

Welcome to our Doctor Appointment Website project named Medicify! This platform enables patients to easily book appointments with doctors at their preferred day and time. Additionally, doctors can apply to be onboarded, with their applications being reviewed and accepted or rejected via the admin panel. We also have predictors using machine learning models for fitness and medical insurance.

## Setting Up the Project

To get started with setting up the project, follow these steps:

1. **Environment Variables Setup:**

    - For the client folder, create a `.env.local` file and configure the following variables:
    
        ```
        VITE_APP_CLOUD_NAME=
        VITE_APP_PRESET=
        VITE_APP_BASE_URL=
        VITE_RAZORPAY_KEY_ID=
        ```

    - For the backend, create a `.env` file and set up the following environment variables:
    
        ```
        PORT=
        JWT_SECRET=
        DB_URL=
        NODE_ENV=
        FRONTEND_URL=
        REDIS_HOST=
        REDIS_PORT=
        REDIS_USERNAME=
        REDIS_PASSWORD=
        RAZORPAY_KEY_ID=
        RAZORPAY_KEY_SECRET=
        RAZORPAY_WEBHOOK_SECRET=
        ```

2. **Docker Compose:**
   
   Run the following command to set up the environment using Docker Compose:
   
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```


## Link to other repositories
- AWS SES Worker - https://github.com/RitwikKapoor/SES-Worker-Medicify
- ML-APIs - https://github.com/RitwikKapoor/Medicify-Flask-API



- Note: You will not receive the email since AWS SES is in sandboxed environment and only verifired emails can receive the email