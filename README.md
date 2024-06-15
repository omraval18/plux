# Plux: Chat with Your PDFs

Plux is a Next.js application that allows users to interact with their PDF files through chat. This project leverages LangChain, Pinecone, and TogetherAI for document embedding and retrieval, and Groq (Llama-3).

## Project Setup

### Clone the Repository

```bash
git clone https://github.com/omraval18/plux.git
```

### Install Dependencies

Navigate to the project directory and install the required dependencies:

```bash
cd plux
pnpm install
```

### Environment Configuration

Create a `.env.local` file at the root of the project and add the following environment variables:

```plaintext
# TogetherAI API key
TOGETHER_AI_API_KEY=your_togetherai_api_key

#Groq API Key
GROQ_API_KEY=your_groq_api_key

# Pinecone API key
PINECONE_API_KEY=your_pinecone_api_key

# Stripe keys
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Database connection string (Prisma)
DATABASE_URL=your_database_connection_string

# Optional: Kinde Auth variables
KINDE_AUTH_CLIENT_ID=your_kinde_auth_client_id
KINDE_AUTH_CLIENT_SECRET=your_kinde_auth_client_secret
KINDE_AUTH_DOMAIN=your_kinde_auth_domain

# Server URL for absolute URL function
SERVER_URL=http://localhost:3000
```

### Set Up Pinecone

1. Create an account at [Pinecone](https://www.pinecone.io/).
2. Create a new index named 'plux' with a dimension of 768.
3. Save your Pinecone API key in the `.env.local` file.

### Set Up Stripe

1. Create an account at [Stripe](https://stripe.com/).
2. Create a new product and pricing plan for your Pro plan.
3. Use the Stripe price IDs in the `PLANS` array within `src/config/stripe.ts`.
4. Save your Stripe keys in the `.env.local` file.

### Database Setup

This project uses Prisma for database management. Install Prisma CLI globally:

```bash
pnpm install -g prisma
```


Run the migrations:

```bash
npx prisma migrate dev
```

### Start the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## Additional Configuration

### Update Absolute URL Function

In `src/lib/utils.ts`, update the `absoluteUrl` function to use your `SERVER_URL`:

```typescript
export function absoluteUrl(path: string) {
    return `${process.env.SERVER_URL}${path}`;
}
```

### Update API Routes

Adjust `src/app/api/message/route.ts` to work with your chosen LLM and its API.

### Update onUploadComplete Function

The `onUploadComplete` function in `src/app/api/uploadthing/core.ts` assumes the use of TogetherAIEmbeddings. Update this function to use the correct embeddings model if using a different one.

## Notes

- Ensure Node.js and pnpm are installed on your machine.
- This application uses Kinde Auth for user authentication, which can be customized or replaced.
- Tailor the LLM integration and configuration to suit your chosen model and setup.


