/**
 * CodeShelf — single source of truth for every program shown on the site.
 * ===========================================================================
 *
 * This is the ONLY file you need to edit to publish a new practical.
 * Nothing else in the app hard-codes a subject or a program: the home page,
 * subject pages, search and the code viewer are all generated from the two
 * arrays below.
 *
 * HOW TO ADD A NEW PROGRAM
 * ------------------------
 * 1. If the subject does not exist yet, add an object to `subjects`.
 * 2. Add an object to `programs` and paste the source code into `code`
 *    (use a template literal — backticks — and paste it exactly as-is).
 *
 *   {
 *     id: 'fcfs-cpu-scheduling',            // unique, url-safe
 *     subjectId: 'operating-system',        // must match a subject `id`
 *     title: 'FCFS CPU Scheduling',         // shown as the card + page title
 *     language: 'C',                        // 'C' or 'C++' (used for the badge)
 *     filename: 'fcfs.c',                   // optional — shown above the code
 *     description: '',                      // optional — only shown if non-empty
 *     code: `#include <stdio.h>
 * ...`,
 *   }
 *
 * Rules the app relies on (also enforced by `npm run validate`):
 *   - `id` values must be unique across all programs.
 *   - `subjectId` must match the `id` of an entry in `subjects`.
 *   - `code` must be a non-empty string and is rendered verbatim: never
 *     re-indent, re-format or "fix" it, or the copy button would no longer
 *     return the original file.
 *
 * Every subject listed here must contain at least one program — the UI never
 * renders an empty category.
 */

/**
 * Subjects / categories shown on the home page.
 *
 * `icon`   optional — key from the icon registry in `components/SubjectIcon.jsx`
 *          ('os' | 'dsa' | 'cn' | 'dbms' | 'other'); falls back to 'other'.
 * `accent` optional — 'indigo' | 'emerald' | 'sky' | 'amber' | 'rose' | 'violet'.
 *          Falls back to 'indigo'. Used for the card tint and the language badge.
 */
export const subjects = [
  {
    id: 'operating-system',
    name: 'Operating System',
    icon: 'os',
    accent: 'indigo',
  },
];

/**
 * Programs. Ordered as they should appear inside their subject.
 * `description` is intentionally left empty for the supplied programs because
 * none was provided — the UI simply omits the description block.
 */
export const programs = [
  {
    id: 'fifo-page-replacement',
    subjectId: 'operating-system',
    title: 'FIFO Page Replacement',
    language: 'C',
    filename: 'fifo_page_replacement.c',
    description: '',
    code: `#include <stdio.h>

int main()
{
    int pages[20], frame[10];
    int n, f;
    int i, j, k = 0;
    int hit, pageFault = 0;

    printf("Enter number of pages: ");
    scanf("%d", &n);

    printf("Enter reference string:\\n");
    for(i = 0; i < n; i++)
        scanf("%d", &pages[i]);

    printf("Enter number of frames: ");
    scanf("%d", &f);

    for(i = 0; i < f; i++)
        frame[i] = -1;

    for(i = 0; i < n; i++)
    {
        hit = 0;

        for(j = 0; j < f; j++)
        {
            if(frame[j] == pages[i])
            {
                hit = 1;
                break;
            }
        }

        if(hit == 0)
        {
            frame[k] = pages[i];
            k = (k + 1) % f;
            pageFault++;
        }

        printf("\\nPage %d: ", pages[i]);

        for(j = 0; j < f; j++)
        {
            if(frame[j] == -1)
                printf("- ");
            else
                printf("%d ", frame[j]);
        }

        if(hit)
            printf("Hit");
        else
            printf("Page Fault");
    }

    printf("\\n\\nTotal Page Faults = %d\\n", pageFault);

    return 0;
}
`,
  },
  {
    id: 'lru-page-replacement',
    subjectId: 'operating-system',
    title: 'LRU Page Replacement',
    language: 'C',
    filename: 'lru_page_replacement.c',
    description: '',
    code: `#include <stdio.h>

int main()
{
    int pages[20], frame[10];
    int n, f;
    int i, j, k;
    int hit, pageFault = 0;
    int recent[10];

    printf("Enter number of pages: ");
    scanf("%d", &n);

    printf("Enter reference string:\\n");
    for(i = 0; i < n; i++)
        scanf("%d", &pages[i]);

    printf("Enter number of frames: ");
    scanf("%d", &f);

    for(i = 0; i < f; i++)
    {
        frame[i] = -1;
        recent[i] = -1;
    }

    for(i = 0; i < n; i++)
    {
        hit = 0;

        // Check page already present
        for(j = 0; j < f; j++)
        {
            if(frame[j] == pages[i])
            {
                hit = 1;
                recent[j] = i;
                break;
            }
        }

        // Page fault
        if(hit == 0)
        {
            pageFault++;

            // Empty frame check
            for(j = 0; j < f; j++)
            {
                if(frame[j] == -1)
                {
                    frame[j] = pages[i];
                    recent[j] = i;
                    break;
                }
            }

            // If no empty frame, find LRU
            if(j == f)
            {
                k = 0;

                for(j = 1; j < f; j++)
                {
                    if(recent[j] < recent[k])
                        k = j;
                }

                frame[k] = pages[i];
                recent[k] = i;
            }
        }

        printf("\\nPage %d: ", pages[i]);

        for(j = 0; j < f; j++)
        {
            if(frame[j] == -1)
                printf("- ");
            else
                printf("%d ", frame[j]);
        }

        if(hit)
            printf("Hit");
        else
            printf("Page Fault");
    }

    printf("\\n\\nTotal Page Faults = %d\\n", pageFault);

    return 0;
}
`,
  },
];

/** Programs grouped by subject, in subject order. Empty subjects are dropped. */
export const programsBySubject = subjects
  .map((subject) => ({
    subject,
    programs: programs.filter((program) => program.subjectId === subject.id),
  }))
  .filter((group) => group.programs.length > 0);

/** Look up a single subject by id. Returns `undefined` when unknown. */
export function getSubject(subjectId) {
  return subjects.find((subject) => subject.id === subjectId);
}

/** Look up a single program by id. Returns `undefined` when unknown. */
export function getProgram(programId) {
  return programs.find((program) => program.id === programId);
}

/** All programs belonging to a subject, in declaration order. */
export function getProgramsForSubject(subjectId) {
  return programs.filter((program) => program.subjectId === subjectId);
}
