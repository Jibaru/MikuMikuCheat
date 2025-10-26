<div align="center">
    <img src="./banner.png"/>
    <h1 style="font-family: 'Yu Gothic'">MikuMikuCheat</h1>
    <p style="font-style: italic">Cheat your interviews with Miku's help.</p>
</div>

## What is this?

A discreet, real-time interview assistant that runs as a semi-transparent overlay on your desktop. It captures your screen's audio, transcribes it, and provides you with concise, AI-powered answers to keep you one step ahead.

## Getting Started

### Prerequisites

- Go 1.23 or later
- Node.js (which includes npm)

### Installation

1.  Clone the repository
2.  Create a `.env` file
3.  Run the application:
    ```bash
    wails dev
    ```

## Building for Production

To build a production version of the application, run:

```bash
wails build
```

This will create a distributable binary in the `build/bin` directory.

## Tech Stack

- **Backend:** Go, Wails
- **Frontend:** React, TypeScript, Vite
