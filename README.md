# Weekly Work Tracker

A lightweight, self-contained weekly status tracker for keeping your manager informed. No server, no database, no installation required — just a single HTML file that runs in any browser.

## What it does

Organises your working week into three columns:

- **In progress** — what you are actively working on right now
- **Planned** — what you intend to start this week
- **Blocked** — tasks you cannot progress due to something outside your control

As you add tasks throughout the week, a **manager update** is automatically formatted at the bottom of the page, ready to copy and paste into an email, Teams message, or Slack.

## Features

- **Five task states** — in progress, planned, blocked, completed, and cancelled
- **Move tasks between columns** — e.g. move a planned task to blocked if it hits a problem, or unblock a task back to in progress
- **Notes on tasks** — with bullet point and strikethrough formatting support
- **Ongoing tasks** — mark a task as ongoing and it automatically carries over to the next week without any manual action
- **Carry over** — incomplete tasks from previous weeks can be carried forward in one click
- **Week navigation** — browse forwards and backwards through any week; each week's data is stored separately
- **Totals** — item counts for each column shown at a glance
- **Dark mode** — toggle between light and dark themes; preference is remembered
- **Export and import** — download a JSON backup of all your data at any time and restore it on any device
- **Auto-save** — data saves automatically to browser local storage on every change

## How to use

Open the tracker in your browser and use the **How to use** button in the top right for a full guide.

## Hosting

This tracker is hosted via GitHub Pages and available at:

```
https://azzbo77.github.io/weekly-tracker
```

Or via the custom domain:

```
https://tracker.azzbo77.com
```

## Running locally

Download `index.html` and open it in any modern browser. No web server or internet connection is required (the Google Font will fall back to a system font if offline).

Tested in Chrome, Firefox, Safari, and Edge.

## Data and privacy

All data is stored locally in your browser's local storage. Nothing is sent to any server. The tracker makes no network requests other than loading the Google Font on first use.

## Saving your data

Data persists in local storage as long as you use the same browser on the same device. For backups or moving to a new machine, use the **Export JSON** button to download your data and **Import JSON** to restore it.

## Updating

To update the tracker with a new version:

1. Go to the repository on GitHub
2. Click on `index.html`
3. Click the pencil (edit) icon
4. Select all the existing code and replace it with the new version
5. Click **Commit changes**

GitHub Pages will update within a minute or two. Do a hard refresh in your browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac) if you do not see the changes.
