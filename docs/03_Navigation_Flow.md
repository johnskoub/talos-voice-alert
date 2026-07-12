# TALOS Evacuation Platform — Navigation Flow
## Main Navigation

```text
Application
    │
    ▼
Sign In
    │
    ▼
Dashboard
    │
    ▼
Company
    │
    ▼
Floor
    │
    ▼
Floor Plan Editor
    │
    ▼
Simulation
```

## Description

The administrator signs in, selects a company, selects a floor, edits the
floor plan and finally starts an evacuation simulation.

## 1. Application Entry

When the application opens, the user is redirected to the Sign In page.

```text
Application Start
       |
       v
Sign In Page

# If the administrator enters valid credentials, access is granted.
# If the credentials are invalid, an error message is displayed.

Sign In
   |
   +---- Valid credentials ----> Dashboard
   |
   +---- Invalid credentials --> Error message