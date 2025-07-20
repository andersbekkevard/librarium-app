# Git-of-Theseus Commands
I use Git-of-Theseus to track the evolution of my codebase over time.
It helps me visualize how different parts of the project grow and change.
By analyzing commit history, I can identify trends and hotspots in development.
The tool generates charts for daily, weekly, and monthly activity, making progress easy to review.
This insight guides my refactoring and helps maintain a healthy, sustainable codebase.

## Quick Start
```bash
./history/generate_charts.sh
```
Generates monthly, weekly, and daily charts in one command.

## Manual Commands

### Analysis
```bash
git-of-theseus-analyze --outdir history --cohortfm FORMAT --branch dev .
```

### Visualization
```bash
git-of-theseus-stack-plot history/cohorts.json --outfile OUTPUT.png --max-n 15
```

## Time Formats
- **Yearly**: `"%Y"` → "2024"
- **Monthly**: `"%Y-%m"` → "2024-03"
- **Weekly**: `"%Y-W%U"` → "2024-W15"
- **Daily**: `"%Y-%m-%d"` → "2024-03-15"

## Examples

### Weekly Tracking
```bash
git-of-theseus-analyze --outdir history --cohortfm "%Y-W%U" --branch dev .
git-of-theseus-stack-plot history/cohorts.json --outfile history/weekly_stack_plot.png --max-n 15
```

### Daily Tracking
```bash
git-of-theseus-analyze --outdir history --cohortfm "%Y-%m-%d" --branch dev .
git-of-theseus-stack-plot history/cohorts.json --outfile history/daily_stack_plot.png --max-n 15
```

## Other Visualizations
```bash
git-of-theseus-line-plot history/cohorts.json --outfile history/line_plot.png
git-of-theseus-survival-plot history/survival.json --outfile history/survival_plot.png
```

## Output Files
- `history/cohorts.json` - Cohort data
- `history/exts.json` - File extensions
- `history/authors.json` - Author data
- `history/dirs.json` - Directory structure
- `history/domains.json` - Domain analysis
- `history/survival.json` - Survival metrics

## Notes
- Uses `dev` branch by default
- Processes 2 commits at a time
- `--interval` controls minimum time between commits (default: 604800s = 1 week)
- `--all-filetypes` includes non-code files 