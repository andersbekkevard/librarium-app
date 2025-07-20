#!/bin/bash

# Git-of-Theseus Chart Generator
# Generates monthly, weekly, and daily activity charts for the repository

set -e  # Exit on any error

echo "🚀 Starting Git-of-Theseus chart generation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git-of-theseus-analyze is available
if ! command -v git-of-theseus-analyze &> /dev/null; then
    print_error "git-of-theseus-analyze is not installed or not in PATH"
    exit 1
fi

if ! command -v git-of-theseus-stack-plot &> /dev/null; then
    print_error "git-of-theseus-stack-plot is not installed or not in PATH"
    exit 1
fi

# Create history directory if it doesn't exist
if [ ! -d "history" ]; then
    print_status "Creating history directory..."
    mkdir -p history
fi

# Function to generate charts for a specific time format
generate_charts() {
    local format=$1
    local description=$2
    local output_file=$3
    
    print_status "Generating $description data..."
    git-of-theseus-analyze --outdir history --cohortfm "$format" --branch dev . --quiet
    
    print_status "Creating $description stack plot..."
    git-of-theseus-stack-plot history/cohorts.json --outfile "$output_file" --max-n 15
    
    print_success "$description chart created: $output_file"
}

# Generate all three chart types
print_status "Generating monthly chart..."
generate_charts "%Y-%m" "monthly" "history/monthly_stack_plot.png"

print_status "Generating weekly chart..."
generate_charts "%Y-W%U" "weekly" "history/weekly_stack_plot.png"

print_status "Generating daily chart..."
generate_charts "%Y-%m-%d" "daily" "history/daily_stack_plot.png"

print_success "🎉 All charts generated successfully!"
echo ""
print_status "Generated files:"
echo "  📊 history/monthly_stack_plot.png"
echo "  📊 history/weekly_stack_plot.png"
echo "  📊 history/daily_stack_plot.png"
echo ""
print_status "You can also find the raw data files in the history/ directory:"
echo "  📄 history/cohorts.json (latest analysis data)"
echo "  📄 history/exts.json (file extension analysis)"
echo "  📄 history/authors.json (author contribution data)"
echo "  📄 history/dirs.json (directory structure analysis)"
echo "  📄 history/domains.json (domain analysis)"
echo "  📄 history/survival.json (code survival metrics)" 