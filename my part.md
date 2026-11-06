# TypeFlow — Dev 4 Implementation Walkthrough: Tasks 07 & 12
**Author / Owner:** Dev 4 (Jonathan)  
**Assigned Tasks:**
- **Task FE-07:** Build course library, detail and My Courses pages (*SYS-57, SYS-58, SYS-61*)
- **Task FE-12:** Build resumable course path and lesson detail UI (*SYS-58, SYS-59, SYS-60, SYS-61, SYS-64*)

---

## Table of Contents
1. [Executive Summary & Architectural Context](#1-executive-summary--architectural-context)
2. [Task FE-07: Course Catalog, Detail & My Courses Walkthrough](#2-task-fe-07-course-catalog-detail--my-courses-walkthrough)
   - [2.1 Data Architecture & React Query Hook (`useCourses.js`)](#21-data-architecture--react-query-hook-usecoursesjs)
   - [2.2 Catalog Filtering & Search Component (`CourseFilters.jsx`)](#22-catalog-filtering--search-component-coursefiltersjsx)
   - [2.3 Course Card Component (`CourseCard.jsx`)](#23-course-card-component-coursecardjsx)
   - [2.4 Course Library Page (`CourseLibraryPage.jsx`)](#24-course-library-page-courselibrarypagejsx)
   - [2.5 Course Detail & Syllabus Page (`CourseDetailPage.jsx`)](#25-course-detail--syllabus-page-coursedetailpagejsx)
   - [2.6 Student Dashboard Page (`MyCoursesPage.jsx`)](#26-student-dashboard-page-mycoursespagejsx)
3. [Task FE-12: Resumable Course Path & Lesson Detail Walkthrough](#3-task-fe-12-resumable-course-path--lesson-detail-walkthrough)
   - [3.1 Path State Management Hook (`useCoursePath.js`)](#31-path-state-management-hook-usecoursepathjs)
   - [3.2 Individual Lesson Node Component (`LessonNode.jsx`)](#32-individual-lesson-node-component-lessonnodejsx)
   - [3.3 Course Path Container Component (`CoursePath.jsx`)](#33-course-path-container-component-coursepathjsx)
   - [3.4 Full Course Path Page (`CoursePathPage.jsx`)](#34-full-course-path-page-coursepathpagejsx)
   - [3.5 Global Learning Path Integration (`LearningPath.jsx`)](#35-global-learning-path-integration-learningpathjsx)
4. [Data Layer, Routing & Mock Fixture Fallback](#4-data-layer-routing--mock-fixture-fallback)
   - [4.1 API Client & Scenario Engine (`client/src/api/courses.js`)](#41-api-client--scenario-engine-clientsrcapicoursesjs)
   - [4.2 Mock Data Fixtures (`client/src/mocks/courses.js`)](#42-mock-data-fixtures-clientsrcmockscoursesjs)
   - [4.3 Routing & Active Session Launching (`client/src/app/router.jsx`)](#43-routing--active-session-launching-clientsrcapprouterjsx)
5. [Core Engineering Principles & SRS Rule Adherence](#5-core-engineering-principles--srs-rule-adherence)
6. [Manual Verification & Testing Guide](#6-manual-verification--testing-guide)

---

## 1. Executive Summary & Architectural Context

### Role and Scope
Under **SRS Section 9.6** and **Decision 0008**, TypeFlow expanded beyond a single static practice track into an **adaptive curriculum and course platform**. In this architecture, Dev 4 (Jonathan) is responsible for the entire student-facing course experience, split into two foundational milestones:
1. **FE-07:** Discovering, inspecting, filtering, and enrolling in courses, plus viewing personalized active enrollments.
2. **FE-12:** Displaying the granular, unit-by-unit and lesson-by-lesson curriculum path, displaying progression states (locked, available, in-progress, completed, placement-exempt), resuming lessons, and safely launching typing exercises.

### Golden Rules Followed
- **Course Progress vs. Key Mastery Separation (SYS-59, SYS-61):** A student's typing key mastery (per-key accuracy and speed) is tracked globally. A course enrollment tracks progression through structured pedagogical units. Completing a lesson updates course progress, but does not artificially manipulate the raw adaptive key evidence or vice-versa.
- **Server-Authoritative Progress (SYS-64):** The frontend *never* marks a lesson complete locally upon typing exercise completion. The backend replay engine verifies official results, and client queries re-fetch fresh state.
- **Session Collision Prevention:** If a student already has an active typing session running for Course A, navigating to Course B and starting a lesson prompts a destructive confirmation dialog before switching, preventing corrupted state.
- **Zero Exposure of Drafts (SYS-57):** Draft courses are strictly excluded from all student views and fixture fallbacks.
- **Opaque Version and Enrollment Identifiers:** Identifiers such as `cv-foundations-v1` and `enr-layla-...` are treated as opaque strings rather than locally manipulated IDs.
- **Bilingual & RTL-Ready:** Every component integrates `useTranslation`, standard design tokens, and RTL-safe utility classes (`ps-`, `pe-`, `start-`, `end-`, `rtl:rotate-180`).

---

## 2. Task FE-07: Course Catalog, Detail & My Courses Walkthrough

### 2.1 Data Architecture & React Query Hook (`useCourses.js`)
File: `client/src/features/courses/hooks/useCourses.js`

This file provides four custom React Query hooks that encapsulate all network communication, caching, and state synchronization for course discovery and enrollment.

- **`useCourses(filters)`**:
  - Fetches the course catalog matching search, difficulty level, topic, and publication status.
  - Query key: `queryKeys.courses(filters)` (`['public', 'courses', filters]`), ensuring filter changes automatically trigger smooth background fetches or use cached results.
  - Stale time: 60 seconds.
- **`useCourseDetail(courseId)`**:
  - Queries full syllabus, units, lessons, prerequisites, and objectives for a specific course by ID or slug.
  - Enabled guard: `Boolean(courseId)` avoids redundant requests when params are undefined.
- **`useMyCourses()`**:
  - Retrieves all active and completed course enrollments for the currently authenticated student.
  - Scoped by user ID (`queryKeys.myCourses(ownerId)`) with a 30-second stale time.
- **`useEnrollCourse()`**:
  - A mutation hook invoking `enrollCourse(courseId, { csrfToken })`.
  - On success, it calls `queryClient.invalidateQueries` for both `myCourses` and the general course catalog, ensuring progress bars and action buttons update instantly across the entire application without a full page reload.

---

### 2.2 Catalog Filtering & Search Component (`CourseFilters.jsx`)
File: `client/src/features/courses/components/CourseFilters.jsx`

This component renders the search and multi-dimensional filter bar used in the catalog.

#### Key Features & Implementation:
1. **Search Input with Instant Clear:**
   - Real-time text search bound to `search` prop with an accessible clear (`XIcon`) button.
   - RTL aware: dynamically uses `pe-9` (or `ps-9` in RTL) and positions the clear icon at `end-2.5` or `start-2.5`.
2. **Topic & Status Dropdowns:**
   - Topics: *All Topics*, *Foundations*, *Speed Building*, *Numbers & Symbols*, *Code & Prose*.
   - Statuses: *All*, *Published*, *Archived*.
3. **Pill-Style Level Selection:**
   - Visual toggle buttons for *All Levels*, *Beginner*, *Intermediate*, *Advanced*.
   - Active pills highlight with the semantic `bg-learning-accent text-learning-foreground` token.
4. **Active Filter Detection & Reset:**
   - When any filter deviates from default, a reset button appears with a `RotateCcwIcon` to restore defaults in one click.
5. **Interactive Reviewer Scenario Toolbar (SYS-57 Testing):**
   - Directly allows reviewers or instructors to simulate edge cases:
     - `default`: Normal catalog with published courses.
     - `empty_catalog`: Empty state test.
     - `conflict_enroll`: Simulates HTTP 409 Conflict (student already enrolled).
     - `error_enroll`: Simulates HTTP 500 server failure on enrollment.

---

### 2.3 Course Card Component (`CourseCard.jsx`)
File: `client/src/features/courses/components/CourseCard.jsx`

The primary presentation card displayed in catalog grids and course listings.

#### Key Features & Implementation:
1. **Dynamic Metadata Badges:**
   - Difficulty pill with custom color tokens:
     - Beginner: `bg-learning-soft text-learning-strong`
     - Intermediate: `bg-action-soft text-action-primary`
     - Advanced: `bg-warning-soft text-warning-text`
   - Topic tag and lock icon for archived courses.
2. **Key Focus Indicator:**
   - Displays targeted keyboard keys (e.g., `Home row (ASDF JKL;) & Index reaches (GH)`) in monospace font for high visual clarity.
3. **Course Metrics:**
   - Displays estimated time in hours, total unit count, and total lesson count.
4. **Conditional Enrollment State & Progress Bar:**
   - If the student is already enrolled:
     - Shows progress percentage bar (`role="progressbar"`).
     - Shows current active lesson title (e.g., "Next: Right Hand Anchors").
     - Renders a prominent **"Resume Course"** action linking directly to the student's current lesson on `/courses/:courseId/path`.
   - If the course is archived:
     - Displays "Archived" badge and disables new enrollment, providing a "View Details" button only.
   - If unenrolled:
     - Renders an **"Enroll"** button (with loading spinner feedback when `isEnrolling` is true) alongside "View Details".

---

### 2.4 Course Library Page (`CourseLibraryPage.jsx`)
File: `client/src/features/courses/pages/CourseLibraryPage.jsx`

The main entry point for students discovering curriculum options (`/courses`).

#### Key Features & Implementation:
1. **Declarative State Management:**
   - Local state for search query, level, topic, status, review scenario, and mutation feedback alerts.
2. **Concurrent Data Fetching:**
   - Simultaneously queries catalog courses (`useCourses`) and the student's existing enrollments (`useMyCourses`) so cards know whether the student is already enrolled.
3. **Graceful Loading, Empty, and Error States:**
   - Displays `<Loading message="..." />` during initial query.
   - If search or filters yield 0 results, shows `<EmptyState />` with a direct "Reset Filters" action.
   - If catalog is empty (scenario `empty_catalog`), prompts reviewer to reset to default.
4. **Enrollment Mutation Feedback:**
   - Shows a green success banner or accessible `<ErrorMessage />` when enrollment completes or encounters conflict/error.
5. **Fixture Transparency Notice:**
   - Under current development, clearly displays a non-intrusive banner indicating mock/fixture demonstration data is active, keeping grading transparent.

---

### 2.5 Course Detail & Syllabus Page (`CourseDetailPage.jsx`)
File: `client/src/features/courses/pages/CourseDetailPage.jsx`

Detailed syllabus inspection and enrollment page accessible via `/courses/:courseId`.

#### Layout & Implementation Details:
1. **Two-Column Responsive Layout:**
   - **Left Column (2/3 width):** Course overview, learning objectives checklist, prerequisites list, and interactive curriculum preview.
   - **Right Column (1/3 width):** Sticky action card with enrollment CTA or progress resume panel.
2. **Interactive Unit Accordion (Curriculum Preview):**
   - Units can be expanded/collapsed (`expandedUnit` state).
   - Inside each unit, displays individual lesson titles, introduced keys in `<span className="font-mono">`, and activity types (`lesson`, `practice`, `checkpoint`, `review`).
3. **Prerequisites Checklist (SYS-58):**
   - Explicitly presents required skills or foundations needed before starting.
4. **Sticky Enrollment & Resume Card:**
   - If enrolled, displays current progress percentage, completed lesson counts, next lesson title, and a high-visibility "Resume Course" button.
   - If unenrolled, provides the "Enroll Now" action with error feedback handling.

---

### 2.6 Student Dashboard Page (`MyCoursesPage.jsx`)
File: `client/src/features/courses/pages/MyCoursesPage.jsx`

Personalized dashboard for students at `/my-courses`.

#### Key Features & Implementation:
1. **Metrics Summary Strip:**
   - Three quick-metric summary tiles: *Total Enrolled*, *In Progress*, and *Completed*.
2. **Filter Tabs:**
   - Quick tabs to switch between *All Courses*, *In Progress*, and *Completed*, each displaying real-time item counts.
3. **Individual Enrollment Cards:**
   - Displays course title, enrollment timestamp / ID, progress bar, current lesson, and a direct "Resume" or "Review" button.
4. **Empty State Onboarding:**
   - If student has no enrollments (or scenario `empty_enrollments` is selected), displays an illustration and a "Browse Course Library" CTA button that navigates to `/courses`.

---

## 3. Task FE-12: Resumable Course Path & Lesson Detail Walkthrough

### 3.1 Path State Management Hook (`useCoursePath.js`)
File: `client/src/features/courses/hooks/useCoursePath.js`

Manages loading and observing an enrolled student's ordered course path and lesson progression.

#### Implementation Highlights:
- **Scoped Query Key:** Caches by student ID and course ID (`['student', ownerId, 'course-path', courseId]`), preventing cross-user cache leaks.
- **Reviewer Scenario Controller (`setScenario`):**
  - Allows instant testing of different progression scenarios (`default`, `novice`, `sparse`, `unmet_prerequisites`, `start_error`, `path_error`).
  - Calls `queryClient.invalidateQueries` immediately upon switching scenarios so the UI renders the new tree instantaneously.

---

### 3.2 Individual Lesson Node Component (`LessonNode.jsx`)
File: `client/src/features/courses/components/LessonNode.jsx`

The interactive building block representing each lesson on the curriculum path.

#### Granular Lesson States (SYS-58, SYS-59, SYS-60):
1. **`completed`**:
   - Lesson was successfully passed according to official server replay criteria.
   - Displays green check badge (`bg-success-soft text-success-text`).
   - Action button changes to **"Review Lesson"** with a `RotateCcwIcon`.
2. **`in-progress`**:
   - The current active lesson the student is working on.
   - Features a pulsing action badge (`animate-pulse`) and **"Resume Lesson"** button.
3. **`placement-exempt` (SYS-60):**
   - Validated competence from diagnostic placement.
   - Clearly styled with purple badges (`bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300`) and a `ShieldIcon`.
   - Explains that this node was skipped due to diagnostic testing, distinguishing it from completed lessons and preventing unearned XP or badge rewards.
4. **`available`**:
   - Prerequisites have been satisfied and the student can begin.
   - Displays **"Start Lesson"** action button.
5. **`locked`**:
   - Unmet prerequisites.
   - Disabled button, lock icon, muted opacity (`opacity-75 bg-subtle/40`).
   - Displays accessible explanation text (`reason`) explaining exactly what must be completed first.

#### Pedagogical Metadata Rendered:
- **Introduced Keys:** Styled as keyboard keycaps using semantic `<kbd>` tags (e.g., `<kbd>A</kbd> <kbd>S</kbd>`).
- **Completion Criteria:** Displays target metrics if applicable (e.g., `🎯 95% Min Accuracy`, `⚡ 25 WPM`).
- **Recommended Next Action Badge:** If `isNextAction` is flagged by the server, displays a gold star (`⭐ Recommended Next Action`) and highlights the card border.

---

### 3.3 Course Path Container Component (`CoursePath.jsx`)
File: `client/src/features/courses/components/CoursePath.jsx`

Renders the vertical sequence of units and their child lesson nodes.

#### Structural Breakdown:
- **Unit Container Sections:**
  - Semantic `<section aria-labelledby="unit-heading-{unit.id}">` elements.
  - Header displays unit index badge, completion count (e.g., `3 / 4 Lessons Completed`), unit title, and pedagogical description.
  - Header styling adapts based on whether the unit is *Completed* (green), *In-Progress* (accent ring & soft background), or *Locked* (muted).
- **Nested Lesson Flow:** Maps through `unit.lessons` and renders `<LessonNode />`, wiring the `onStartLesson` callback up to the page controller.

---

### 3.4 Full Course Path Page (`CoursePathPage.jsx`)
File: `client/src/features/courses/pages/CoursePathPage.jsx`

The full screen at `/courses/:courseId/path`.

#### Critical Engineering Highlights:
1. **"Next Up" Hero Banner:**
   - Pulls `path.nextAction` (server-selected recommended activity).
   - Shows the lesson title, rationale, and a large primary "Start / Resume" button so students can jump straight into practice without scrolling.
2. **Placement Exemptions Banner:**
   - If `path.placementExemptionsCount > 0`, renders a dedicated status badge with a shield icon summarizing the number of exempt nodes granted by placement.
3. **Prerequisite Warning Banner:**
   - If the student attempts to access a path with unsatisfied prerequisites, renders an alert banner (`AlertCircleIcon`) explaining the requirement.
4. **Active Session Collision Guard:**
   - If the student has a typing session active in another course and clicks to start a lesson here, `handleStartLesson` detects the mismatch (`activeSession.courseId !== courseId`).
   - Opens `<ConfirmDialog />` asking the user if they wish to abandon their current running session before starting the new one.
   - Prevents running session corruption and accidental assignment loss.
5. **Server-Authoritative Progression Notice:**
   - Includes a clear footer note informing students and reviewers that lesson completion is calculated by server replay and cannot be modified by client tampering.
6. **Testing Scenario Switcher:**
   - Reviewer toolbar allowing quick testing of:
     - `Experienced`: Standard path with mixed completed and in-progress nodes.
     - `Novice`: All nodes locked except Lesson 1.
     - `Sparse`: First unit complete, subsequent lessons available.
     - `Prereq-Locked`: Demonstrates unmet prerequisite banner and locked status.
     - `Start Error`: Tests error message handling when session creation fails.
     - `Path Error`: Tests full error page when network fails.

---

### 3.5 Global Learning Path Integration (`LearningPath.jsx`)
File: `client/src/features/learning-path/LearningPath.jsx`

In accordance with FE-12 requirements (*"Extend existing LearningPath.jsx through reuse, not a competing keyboard map"*), `LearningPath.jsx` embeds `EnrolledCoursePathSection`.

- Imports `useMyCourses`, `useCoursePath`, and `CoursePath`.
- Allows students viewing their global learning path to see their enrolled course curriculum directly in context, switch between enrolled courses, and start lessons without leaving their main dashboard.

---

## 4. Data Layer, Routing & Mock Fixture Fallback

### 4.1 API Client & Scenario Engine (`client/src/api/courses.js`)
File: `client/src/api/courses.js`

Serves as the boundary between UI components and backend network endpoints.

#### Network-First Architecture with Graceful Mock Fallback:
Every function (`fetchCourses`, `fetchCourseById`, `fetchMyEnrollments`, `enrollCourse`, `fetchCoursePath`) attempts to call the real backend endpoint via `request('/courses...')`. If the endpoint is unconfigured or offline, it transparently catches the failure and falls back to rich, realistic in-memory fixtures.

#### Development Scenario Controller:
Functions like `setCourseReviewScenario` and `setCoursePathScenario` store the active test scenario in memory, enabling full manual end-to-end verification of all success, error, conflict, and edge-case states directly from the UI toolbar.

#### Opaque Enrollment Generation:
When `enrollCourse()` executes in mock mode, it checks for duplicate enrollment (throwing an `ApiError` with code `CONFLICT` and HTTP 409 if already enrolled) and generates an opaque enrollment object:
```javascript
const newEnrollment = {
  id: `enr-layla-${Date.now()}`,
  courseId: course.id,
  courseVersionId: course.versionId,
  status: 'active',
  progressPercent: 0,
  completedLessonsCount: 0,
  totalLessonsCount: course.totalLessons,
  currentUnit: { ... },
  currentLesson: { ... },
  resumeLink: `/courses/${course.id}/path`,
};
```

---

### 4.2 Mock Data Fixtures (`client/src/mocks/courses.js`)
File: `client/src/mocks/courses.js`

Provides realistic, pedagogical typing course content:
1. **`c-foundations-01` ("Touch Typing Foundations"):**
   - 4 Units, 16 Lessons.
   - Focus: Home row rest (`ASDF JKL;`), index reaches (`G`, `H`), checkpoints.
2. **`c-speed-02` ("Speed & Rhythm Mastery"):**
   - Focus: Bigrams, trigrams, rhythm pacing, speed thresholds.
3. **`c-symbols-03` ("Numbers & Common Symbols"):**
   - Focus: Number row reaches, punctuation, bracket pairs.
4. **Multiple Path Topologies:**
   - `mockCoursePathFoundations`: Default experienced student with 37% progress, placement exemptions, and current lesson.
   - `mockCoursePathNovice`: Complete beginner state (0% progress, only Lesson 1 open).
   - `mockCoursePathSparse`: Sparse evidence state for testing progression boundaries.
   - `mockCoursePathUnmetPrerequisites`: Path showing prerequisite lock warnings.

---

### 4.3 Routing & Active Session Launching (`client/src/app/router.jsx`)
File: `client/src/app/router.jsx`

All course routes are integrated cleanly into the main application router:

```jsx
{/* Course Catalog (FE-07) */}
<Route path="/courses" element={<CourseLibraryPage />} />

{/* Course Detail Syllabus (FE-07) */}
<Route path="/courses/:courseId" element={<CourseDetailPage />} />

{/* Resumable Course Path & Lesson Launcher (FE-12) */}
<Route
  path="/courses/:courseId/path"
  element={
    <CoursePathPage
      onStartLesson={(lesson, context) =>
        launchTyping({
          mode: lesson.title,
          courseId: context.courseId,
          lessonId: lesson.id,
          enrollmentId: context.enrollmentId,
          type: lesson.type,
        })
      }
      activeSession={activeSessionConfig}
      onAbandonActiveSession={() => {
        session.controller.clear();
        setFixtureSession(null);
      }}
    />
  }
/>

{/* Student Enrolled Courses Dashboard (FE-07) */}
<Route path="/my-courses" element={<MyCoursesPage />} />
```

When a student clicks to start or resume a lesson on the course path, `onStartLesson` packages the course context (`courseId`, `lessonId`, `enrollmentId`, `type`) and passes it to `launchTyping`, seamlessly mounting the TypeFlow typing engine.

---

## 5. Core Engineering Principles & SRS Rule Adherence

| SRS Requirement | How Dev 4 Implemented It in Code |
| :--- | :--- |
| **SYS-57 (Searchable Published Catalog & Draft Isolation)** | `fetchCourses()` strictly filters out any course where `status === 'draft'`. Search bar filters in real-time across title, description, and focus keys. Level and topic dropdowns allow multi-dimensional filtering. |
| **SYS-58 (Ordered Units, Lessons & Prerequisites)** | `CoursePath.jsx` and `LessonNode.jsx` render strictly ordered unit and lesson sequences. Units and lessons display their index, prerequisite criteria, and rationale. |
| **SYS-59 (Separation of Progress vs. Shared Key Mastery)** | `useCourses.js` and `useCoursePath.js` track unit/lesson completion separately from the global key stat profile in `LearningPath.jsx`. Completing a lesson never artificially fabricates key mastery stats. |
| **SYS-60 (Placement Exemptions Distinction)** | Lessons flagged as `placement-exempt` render with distinct purple shield badges (`ShieldIcon`) and explanatory text, explicitly distinct from `completed` or `mastered` nodes. They do not trigger unearned XP or session rewards. |
| **SYS-61 (Versioned, Opaque Enrollments)** | All enrollments reference opaque IDs (`cv-*`, `enr-*`). Client never derives progress from local clicks. |
| **SYS-64 (Server-Authoritative Progression)** | Progress bars reflect server-supplied percentages. A persistent footer notice reinforces that official exercise completion is validated by server replay. |
| **Session Collision Prevention** | `CoursePathPage` inspects `activeSession` and prompts a `<ConfirmDialog />` if switching courses to avoid corrupting running state. |
| **Bilingual RTL Support** | Uses Tailwind logical properties (`ps-`, `pe-`, `start-`, `end-`) and `useTranslation()` dictionary keys (`courses.*`). Arrow icons flip automatically with `rtl:rotate-180`. |

---

## 6. Manual Verification & Testing Guide

To test or demonstrate both tasks in the browser without writing code or hitting a database:

### Verifying Task FE-07 (Catalog & Enrollment):
1. **Navigate to Course Catalog:** Open `/courses`.
2. **Test Search & Filters:**
   - Type `"home"` in the search input to filter for Touch Typing Foundations.
   - Click the "Beginner" or "Intermediate" pills to verify level filtering.
   - Select "Archived" from the status dropdown to verify archived courses display lock badges and disable enrollment.
3. **Test Empty State:**
   - In the review scenario toolbar, click `Empty Catalog` to view the empty state screen. Click `Default` to restore.
4. **Test Course Enrollment:**
   - On an unenrolled course, click **"Enroll"**. Observe the loading state and subsequent success banner. The card will update immediately to show progress and a **"Resume"** button.
5. **Test Enrollment Error / Conflict:**
   - Switch toolbar to `Conflict (409)` and click Enroll on a course to observe duplicate enrollment error handling.
   - Switch toolbar to `Server Error (500)` to observe network error handling and the retry action.
6. **Inspect Course Detail:**
   - Click **"View Details"** on any course to open `/courses/:courseId`.
   - Expand and collapse units in the curriculum accordion. Notice lesson types and key chips.
7. **Inspect My Courses Dashboard:**
   - Click "My Courses" in the top bar or navigate to `/my-courses`.
   - Check the summary metric cards (*Total Enrolled*, *In Progress*, *Completed*).
   - Switch between the *All*, *In Progress*, and *Completed* tabs.

### Verifying Task FE-12 (Course Path & Lesson Progression):
1. **Open Course Path:**
   - From `/my-courses` or `/courses`, click **"Resume Course"** or navigate to `/courses/c-foundations-01/path`.
2. **Inspect Next Action Hero Banner:**
   - Verify the top banner highlights the server-selected recommended lesson with reason text and a prominent "Resume / Start" button.
3. **Verify Node States in the Path:**
   - **Completed Nodes:** Green checkmarks, "Review Lesson" button.
   - **In-Progress Nodes:** Pulsing play icon, "Resume Lesson" button.
   - **Placement-Exempt Nodes:** Purple shield icon, "Placement Exempt" badge with explanation.
   - **Locked Nodes:** Lock icon, disabled button, reason explaining unmet prerequisites.
4. **Test Progression Scenarios:**
   - Click `Novice` in the toolbar: All units lock except Unit 1, Lesson 1.
   - Click `Sparse`: Path updates to show sparse evidence state.
   - Click `Prereq-Locked`: Notice the prominent yellow warning banner explaining missing prerequisites.
   - Click `Start Error`: Attempt to start a lesson and verify the error alert displays cleanly.
   - Click `Path Error`: Verify the full-page error display with a retry button.
5. **Test Session Launching:**
   - Click **"Start Lesson"** or **"Resume Lesson"** on any available node. Verify it calls `onStartLesson` and launches the typing test with the lesson's key targets.
6. **Verify Global Learning Path Integration:**
   - Navigate to `/learning-path` and scroll down to observe the embedded `EnrolledCoursePathSection`, confirming seamless reuse without duplicate keyboard widgets.
