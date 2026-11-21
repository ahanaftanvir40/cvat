# Objectives

## Machine and versions

| | |
|---|---|
| CPU | Apple M5, 10 cores |
| RAM | 16 GB (Docker Desktop given 10 CPUs and about 7.7 GiB) |
| OS | macOS 27.2 (build 26B123) |
| Docker | 29.8.1 |
| CVAT commit cloned | `d4d08dedb5ad7c5e980c0bc7319a7f5587365dad` |
| Sample data | First 500 images of COCO 2017 val by file name (`000000000139.jpg` to `000000056545.jpg`), 3,541 COCO annotations, 80 categories |
| Test task | Task 1, 500 frames, 1 job, 3,953 shapes after import |

## MO-1: Endpoint response time

| Field | Entry |
|---|---|
| What is measured | Time for the per-label count endpoint to answer for task 1. |
| How | `curl` with `-w '%{time_total}'` against `http://localhost:8080`, logged in as admin. One warm-up request, then 5 measured requests. Raw output saved under `docs/evidence/`. |
| Target | Median of 5 runs at or below **TBD** ms. Set once the endpoint exists, using CVAT's own `GET /api/tasks/1` measured the same way as the baseline. |
| Conditions | Local Docker stack on the machine above, task 1 unchanged, nothing else running, server already warm. |
| Not included | Browser rendering time, the first request after a server restart, tasks other than task 1. |
