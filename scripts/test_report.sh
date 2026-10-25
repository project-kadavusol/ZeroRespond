#!/usr/bin/env bash
# ==============================================================================
# ZeroRespond - Test Report Generator Script
# Owner: Prithiv Raj (Module 4 - Compliance & DevOps)
#
# Usage:
#   ./scripts/test_report.sh [path_to_case_json]
#   or from within scripts/:
#   ./test_report.sh [path_to_case_json]
# ==============================================================================

set -e

# Always find the true project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Resolve case file argument
INPUT_CASE="${1:-}"
if [ -z "$INPUT_CASE" ]; then
    CASE_FILE="$PROJECT_ROOT/data/mock_cases/IR-08_ransomware.json"
elif [ -f "$INPUT_CASE" ]; then
    CASE_FILE="$(cd "$(dirname "$INPUT_CASE")" && pwd)/$(basename "$INPUT_CASE")"
elif [ -f "$PROJECT_ROOT/$INPUT_CASE" ]; then
    CASE_FILE="$PROJECT_ROOT/$INPUT_CASE"
else
    echo "[!] Error: Case file '$INPUT_CASE' does not exist."
    echo "    Available demo cases:"
    echo "      $PROJECT_ROOT/data/mock_cases/IR-08_ransomware.json"
    echo "      $PROJECT_ROOT/data/mock_cases/IR-07_bruteforce.json"
    echo "      $PROJECT_ROOT/data/mock_cases/IR-06_privilege_escalation.json"
    echo "      $PROJECT_ROOT/data/mock_cases/IR-05_file_integrity.json"
    exit 1
fi

echo "=========================================================="
echo " ZeroRespond DPDP Incident Report Generator"
echo " Case: $(basename "$CASE_FILE")"
echo "=========================================================="

cd "$PROJECT_ROOT"

# Step 1: Render Jinja2 Template to HTML Preview via report_generator service
echo "[1/2] Generating HTML Preview..."
python3 -c "import sys, json; sys.path.insert(0, '$PROJECT_ROOT/backend'); from services.report_generator import generate_report; generate_report(json.load(open('$CASE_FILE')), preview_only=True)"

# Extract Case ID
CASE_ID=$(python3 -c "import json; d=json.load(open('$CASE_FILE')); print(d.get('case',{}).get('id','report'))")
PREVIEW_FILE="$PROJECT_ROOT/data/reports/${CASE_ID}_preview.html"
PDF_FILE="$PROJECT_ROOT/data/reports/${CASE_ID}_report.pdf"

# Step 2: Compile to PDF via Docker WeasyPrint
echo "[2/2] Compiling PDF via Docker WeasyPrint..."
docker run --rm -v "$PROJECT_ROOT:/workspace" -w /workspace minidocks/weasyprint \
    weasyprint "data/reports/${CASE_ID}_preview.html" "data/reports/${CASE_ID}_report.pdf"

echo ""
echo "=========================================================="
echo " [✓] Success! Files generated at:"
echo "   • PDF Report:   $PDF_FILE"
echo "   • HTML Preview: $PREVIEW_FILE"
echo "=========================================================="
echo ""
echo "To open the PDF, copy and paste this command:"
echo "   evince \"$PDF_FILE\" &"
echo "   or: xdg-open \"$PDF_FILE\""
echo ""
echo "To open the HTML preview in your browser:"
echo "   firefox \"$PREVIEW_FILE\" &"
