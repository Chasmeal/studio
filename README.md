# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Workflow

The application workflow is as follows:

1.  **User Authentication:** Users can sign up or log in to access their projects.
2.  **Project Management:** Authenticated users can create, view, and select projects.
3.  **Task Management:** Within a selected project, users can view tasks on a Kanban board, create new tasks, update task details (status, priority, due date), and delete tasks.
4.  **AI Assistance:** The application includes AI flows, such as `suggestTaskPriority`, which can assist users with task management.

## Tech Stack

TaskZen is built using the following technologies:

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Firebase (Authentication, Firestore)
- **AI:** Genkit
- **Language:** TypeScript

To get started, take a look at src/app/page.tsx.

# **App Name**: TaskZen

## Core Features:

- Project Listing: Displays the user's projects in a clear, card-based layout. Allows users to select a project to view its tasks.
- Project Creation: Enables users to create new projects, including setting a name, description and a representative color for visual identification.
- Task Board: Allows users to view tasks organized by status (e.g., 'To Do', 'In Progress', 'Done') in a Kanban board layout.
- Task Management: Enables users to create, update, and delete tasks with details such as title, description, status, priority, and due date.

## Style Guidelines:

- Primary color: Calm blue (#3498db) for focus and productivity.
- Secondary colors: Light grey (#ecf0f1) for backgrounds and borders.
- Accent: Teal (#1abc9c) for active elements and highlights.
- Clean and readable sans-serif fonts for interface elements.
- Use consistent and clear icons from a library like Font Awesome or Material Icons to represent task actions and statuses.
- Clean, card-based layout for projects and tasks, ensuring a clear visual hierarchy.
- Subtle transitions for task status updates (e.g., moving a card between columns) to enhance user feedback.

