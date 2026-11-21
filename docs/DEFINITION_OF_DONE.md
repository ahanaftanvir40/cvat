# Definition of Done

Written before the code. A line is only ticked when the evidence is next to it.

## The feature

- [x] Endpoint returns a count for every label of task 1, and the numbers match a direct SQL
      query on the CVAT database. Evidence: 80 labels, 0 mismatches, total 3,953 =
      3,953, `docs/evidence/item1-count-check.txt`
- [x] The same numbers match an independent count from the COCO JSON for the 500 imported
      images. Evidence: 0 mismatches against COCO polygon pieces + crowd masks per category,
      total 3,953, same file
- [x] The count is done by the database, not by looping in Python. Evidence:
      `cvat/apps/test/views.py:43-47` (one `GROUP BY label_id` query per annotation table),
      commit e2c2f73cd
- [x] A request with no login is refused. Evidence: HTTP 401,
      `docs/evidence/item1-endpoint-responses.txt`
- [ ] The page opens from the task page and shows one bar per label. Evidence (screenshot):
      opening part done: Actions → "Annotations per label" leads to `/tasks/1/label-counts`,
      which calls the endpoint through cvat-core (200) and shows "3953 annotations across
      80 labels", `docs/evidence/item2-task-actions-menu.png`,
      `docs/evidence/item2-label-counts-page.png`, commits 11e045ac8, c57e8d40f. Bars: item 3.
- [ ] A task with no annotations shows an empty message instead of a chart. Evidence (screenshot):
- [ ] A failed request shows an error with a Retry button, and Retry loads the chart once the
      server answers again. Evidence (screenshots):

## Later items (only if items 1 to 4 are done)

- [ ] A user without access to the task is refused. Evidence:
- [ ] MO-1 measured, 5 runs, raw output saved. Evidence:
- [ ] MO-1 target met, or missed with the reason written down. Evidence:
- [ ] Filter or grouping works, and the reason for choosing it is in the Plan. Evidence:
- [ ] Chart updates without reload when an annotation changes. Evidence:
- [ ] Page recovers after the connection drops and returns. Evidence:
- [ ] Decision record added to the Plan. Evidence (commit):

## The submission

- [x] Plan was the first commit, before any code. Evidence: d90a5a6c3 (only `docs/PLAN.md`)
- [ ] Commits are small and each message says what changed and why. Evidence (`git log`):
- [ ] No dataset files, PDF or personal notes in the repository. Evidence (`git ls-files docs`):
- [ ] No dead code, commented-out blocks or stray files in the diff. Evidence:
- [ ] Everything I did not finish is listed in the Plan with the reason. Evidence:
