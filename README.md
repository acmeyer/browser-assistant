# Browser Assistant

Browser Assistant is a browser extension that brings OpenAI's GPT to your browser.

> Note: This is a work in progress. The extension has not been completed or published.

## The Idea Behind It

A number of years ago [I wrote about the idea](https://medium.com/user-experience-design-1/the-personalized-web-b3a4c3671005) of how everyone was going to experience the web differently because of the drive for hyper-personalization. At that time, I had assumed this would be driven by companies updating their products to become more and more personalized to each individual consumer.

Over the years, this has begun to play out, though it is still far from that original vision I had. However, I was not thinking about or aware of how something like AI could present an alternative vision. While it is true that many, if not most, companies will adopt AI in such a way that it will drive this hyper-personalization, one thing I didn't consider was how AI might be used by the *consumer* to personalize the web however they want.

This is the main idea behind this extension. I wanted to build it in a way that might provide the early building blocks for giving web users the ability to personalize the web however they want, regardless of what companies do. A browser extension is a great way to potentially do this as it can access the DOM of a site and modify its contents. Paired with LLMs, I think you could get it to the point where you might be able to ask the AI for a feature to be added to a particular site, it would write the code for that feature, and then it could be saved for future visits.

We're still far from this updated vision but I wanted to at least start building towards it. The result is this early stage extension. If you also want to see this vision become a reality, I'd love for you to help contribute to the project.


## How It Works

There are two main components to this repository. The first is the browser extension in the [`/extension`](./extension/) directory. This directory hosts all of the browser extension's code. The second is the backend server in the [`/backend`](./backend/) directory. This directory hosts all of the code for the backend server that the extension uses.

### Browser Extension

The extension is a [Manifest v3 browser extension](https://developer.chrome.com/docs/extensions/mv3/intro/). Currently, it mostly utilizies the extension [Side Panel API](https://developer.chrome.com/docs/extensions/reference/sidePanel/) since that seems like the best UX for this particular extension type. Though there are potential plans to also utilize the [New Tab API](https://developer.chrome.com/docs/extensions/mv3/override/) as well.

The code uses [Vite](https://vitejs.dev/) to build the extension and is written in Typescript.

To run the extension locally, you can run the following commands:

```bash
cd extension
yarn install
yarn dev
```

To build the extension for production, you can run the following commands:

```bash
cd extension
yarn install
yarn build
```

Be sure to update the `extension/.env` file with the appropriate values before building the extension or it will not work (you can copy `extension/example.env` for required variables).

To install the extension locally, follow [this guide](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).

### Backend Server

The backend server is a standard Nodejs Express app and is written in Typescript. It also uses [Firestore](https://firebase.google.com/docs/firestore) and [Pinecone](https://www.pinecone.io/) database for storage.

You need to set the environment variables in `backend/.env`. You can copy `backend/example.env` for required variables.

To run the server locally:

```bash
cd backend
yarn install
yarn start
```

## Improvements to make

- [ ] Add webpage modification
- [ ] Add browser interaction/navigation
- [ ] Handle errors
- [ ] Add content moderation
- [ ] Add user authentication/accounts

