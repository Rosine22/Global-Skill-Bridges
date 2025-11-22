# Project Screenshots

This file lists recommended screenshots to capture from the project and provides placeholder image tags and captions. Paste your exported PNG files into `docs/screenshots/` (or `screenshots/`) and keep the filenames listed below so slides/docs stay consistent.

Create a `screenshots/` folder at the repo root and save files with the exact names below.

Recommended filenames and placeholders

1. `01_EmployerApproval_auth.png`
   ![Auth check](./screenshots/01_EmployerApproval_auth.png)
   - Caption: Page guarded for `admin`/`rtb-admin` and redirects unauthenticated users.

2. `02_EmployerApproval_fetch.png`
   ![Fetch employers](./screenshots/02_EmployerApproval_fetch.png)
   - Caption: `fetchEmployers` fetches pending and approved employers, includes error handling.

3. `03_EmployerApproval_handlers.png`
   ![Approve and reject handlers](./screenshots/03_EmployerApproval_handlers.png)
   - Caption: `handleApprove`, `handleReject`, and `submitReject` call backend approval endpoints.

4. `04_EmployerApproval_list_modal.png`
   ![List and modal](./screenshots/04_EmployerApproval_list_modal.png)
   - Caption: Employer cards list, search bar, and detail modal with action buttons.

5. `05_api_config.png`
   ![API config](./screenshots/05_api_config.png)
   - Caption: `frontend/src/config/api.ts` shows `API_ENDPOINTS` and `getAuthHeaders`.

6. `06_auth_context.png`
   ![Auth context](./screenshots/06_auth_context.png)
   - Caption: `AuthContext` supplying `user` and `logout` used on admin pages.

7. `07_notification_dialogs.png`
   ![Notifications and dialogs](./screenshots/07_notification_dialogs.png)
   - Caption: `NotificationContext` and `ConfirmDialog`/`PromptDialog` components.

8. `08_backend_routes.png`
   ![Backend routes](./screenshots/08_backend_routes.png)
   - Caption: Backend admin routes (pending list, approve endpoint).

9. `09_user_model.png`
   ![User model](./screenshots/09_user_model.png)
   - Caption: Model fields like `isApproved`, `approvalDate`, `approvedBy`.

10. `10_server_setup.png`
    ![Server setup](./screenshots/10_server_setup.png)
    - Caption: Where admin routes are mounted and auth middleware is applied.

11. `11_frontend_package.png`
    ![Frontend package.json](./screenshots/11_frontend_package.png)
    - Caption: Frontend `package.json` showing scripts and key deps.

12. `12_backend_package.png`
    ![Backend package.json](./screenshots/12_backend_package.png)
    - Caption: Backend `package.json` showing scripts and dependencies.

13. `13_project_README.png`
    ![Project README](./screenshots/13_project_README.png)
    - Caption: Project overview for presentation context.

How to capture (quick steps for Windows + VS Code)

- Open file in VS Code and focus the editor (close sidebars to reduce clutter).
- Use `View → Appearance → Toggle Activity Bar` or collapse side panels if needed.
- Open the target file at a convenient line using the `code` CLI (if installed):

```powershell
code -g frontend/src/pages/admin/EmployerApproval.tsx:1
code -g frontend/src/config/api.ts:1
code -g frontend/src/contexts/AuthContext.tsx:1
code -g frontend/src/contexts/NotificationContext.tsx:1
code -g frontend/src/components/ConfirmDialog.tsx:1
code -g frontend/src/components/PromptDialog.tsx:1
code -g backend/routes/admin.js:1
code -g backend/models/User.js:1
code -g backend/app.js:1
```

- Capture: press `Win+Shift+S` and select a rectangular snip. Save as PNG in `docs/screenshots/`.
- Optional: annotate with Snip & Sketch (arrow + highlight) to call out endpoints, headers, or `fetch` calls.

Crop guidance for each EmployerApproval shot
- `01_EmployerApproval_auth.png`: Top block with imports, `BackendEmployer` type, and the top `useEffect` auth/role redirect.
- `02_EmployerApproval_fetch.png`: The full `fetchEmployers` function including both fetches and error handling.
- `03_EmployerApproval_handlers.png`: The `handleApprove`, `handleReject`, and `submitReject` implementations.
- `04_EmployerApproval_list_modal.png`: The map/render of cards and the modal block (two images allowed if needed).

Presentation suggestions
- Option A (slides): Insert images into PowerPoint/Google Slides in numeric order. Add 1–3 bullets per slide explaining the importance.
- Option B (repo docs): Keep these images in `docs/screenshots/` and reference them from this file; commit images to the repo.

Checklist before presenting

- [ ] Screenshots saved in `docs/screenshots/` with the exact filenames above.
- [ ] Each image has a one-line caption in this file.
- [ ] Optional annotations applied to critical lines (API URL, auth header usage, fetch `.ok` checks).

If you want, I can also:

- create the `docs/screenshots/` folder and add empty placeholder files (zero-byte) to help you place images, or
- open the repo files at exact lines with `code -g` commands prepared in a separate script file.

Next steps for me (tell me which you want):
- I can create the `docs/screenshots/` folder and empty placeholder files now.
- I can generate a `scripts/open-for-screenshots.ps1` file with `code -g` commands for each shot.

--
Saved: `docs/screenshots.md` — paste images into `docs/screenshots/` and they will render here.
