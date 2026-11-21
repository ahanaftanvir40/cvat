# Plan

Add a per-label annotation count to CVAT: an API endpoint that reads the counts from the
database, and a page in the web UI that draws them as a bar chart.

Base commit: `d4d08dedb5ad7c5e980c0bc7319a7f5587365dad`. Sample data: the first 500 images
of COCO 2017 val (sorted by file name) with `instances_val2017.json` imported as COCO 1.0.

## What I found before planning

- Every annotation row has a `label` foreign key, defined on the abstract `Annotation` model
  in `cvat/apps/engine/models.py`. Annotations belong to a job, not to the task, so the path is
  task → segment → job → annotation → label.
- "One annotation" will mean one object: a top-level shape, a whole track (not each frame of
  it) or a tag. Skeleton points are not counted on their own.
- Only the jobs CVAT itself treats as the task's annotations are counted (the same rule as
  `TaskAnnotation` in `cvat/apps/dataset_manager/task.py`). Ground truth and consensus
  replica jobs would otherwise be counted twice.
- A task inside a project takes its labels from the project, so labels come from
  `Task.get_labels()`. Labels with zero annotations are still returned.
- CVAT's permission layer rejects any view that does not declare a permission class, so even
  the first version of the endpoint needs an explicit choice (see Changes).
- The UI already depends on `chart.js` and `react-chartjs-2`, so no new frontend package.
- The UI already has a `/tasks/:tid/analytics` route, so the new page goes on
  `/tasks/:tid/label-counts`.

## Order of work

Times are rough and add up to the 8 hours. Waiting for Docker builds and the dataset import
is not counted.

1. **Endpoint** (about 1 h). New Django app `test` with one read-only endpoint. The count is a
   single grouped query in the database, not a loop in Python. I check the numbers against a
   direct SQL query and against the COCO JSON for the same 500 images.
2. **Page** (about 45 min). Add a function to `cvat-core` the same way existing endpoints are
   wired, then a page that calls it, linked from the task page.
3. **Chart** (about 30 min). One bar per label, using the existing chart library.
4. **Empty and error states** (about 30 min). A clear message when the task has no
   annotations; an error message with a Retry button when the request fails.
5. **Access** (about 30 min). Reuse CVAT's existing task view permission, so a request with no
   login and a user without access to the task are both refused. Shown with the admin and a
   non-admin user.
6. **Speed objective** (about 45 min). Set a response time target for the endpoint, measure it
   five times, report median and spread in `OBJECTIVES.md`.
7. **One filter or grouping** (about 45 min). Chosen once items 1 to 6 work; the reason goes
   in Changes.
8. **Live updates over WebSocket** (about 1 h 15 min). The riskiest item: CVAT runs on ASGI
   under uvicorn but has no WebSocket layer, so this likely means adding one.
9. **Reconnect** (about 30 min). The page recovers when the connection drops and comes back.
10. **Decision record** (about 15 min). Added at the end of this file.

The remaining time (about 1 h 15 min) covers these documents, collecting evidence for the
Definition of Done and a final review of the diff.

Items 1 to 4 must work before anything after them starts. If time runs out, I stop at a
working item and list what was not reached and why.

## Skipping on purpose

- No new database tables. Counts are computed on each request, not stored.
- No changes to existing CVAT pages apart from the new route and a link to it.
- No refactoring of existing CVAT code.

## Changes

- **Permissions before item 5.** Because CVAT rejects views without a declared permission
  class, the endpoint starts with login-only access (`IsAuthenticated`). Until item 5 any
  logged-in user can read counts for any task; item 5 closes that.
