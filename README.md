This project creates a Spotify widget, which can be embedded into your live streams.

## Getting Started

Add the following to your `/etc/hosts` file:

```
127.0.0.1 myapp.local
```

Generate a new key and certificate for your local development server:

```bash
mkcert myapp.local
```

Take a look at the `.example.env.local` file and create a new file called `.env.local` with your values.

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://myapp.local:3000](http://myapp.local:3000) with your browser to see the result.
