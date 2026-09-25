# Shift Checklist PWA

A static Progressive Web App for worker morning/evening checklists. It is designed to run on GitHub Pages and be installed on a tablet.

## Features

- Morning and Evening shift tabs.
- Date selector, so each day has its own checklist state.
- Done button with a green check mark and completion timestamp.
- Camera/photo upload for each task.
- Photos stored locally in IndexedDB; checklist state stored in localStorage.
- Progress tracker at the top.
- Offline support after the first successful load.
- Installable as a PWA on supported tablets/browsers.

## GitHub Pages

1. Create a GitHub repository.
2. Upload everything in this folder to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Set **Build and deployment → Source** to **Deploy from a branch**.
5. Select the branch containing these files and the **/ (root)** folder.
6. Open the generated GitHub Pages URL over HTTPS.
7. On the tablet, use the browser's **Add to Home Screen / Install App** option. Chrome/Edge may also show the in-app Install App button.

## Local storage note

Nothing is uploaded to a server by this app. Photos and task data stay in the browser's local storage/IndexedDB on that tablet. Clearing browser/site data can delete them. They also do not automatically appear on another tablet or another browser.

## Editing tasks

Morning and evening task lists are at the top of `app.js` in `MORNING_TASKS` and `EVENING_TASKS`.

## Photo storage and camera
- Saved photos are compressed to JPEG (max 1600px) before being stored locally in IndexedDB, reducing device storage use.
- Tap a saved thumbnail to open it full-size.
- “Take Photo” uses the tablet camera directly when the browser grants camera permission. “Choose Photo” is a fallback for the device photo picker.
- Camera access requires the app to be served over HTTPS (GitHub Pages is HTTPS) and the browser must allow camera permission.
- Browser storage is not unlimited; the available IndexedDB quota depends on the tablet/browser. The app compresses photos to make the local storage last longer.
