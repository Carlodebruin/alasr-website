# Application Form Rollback Notes

Created: 2026-03-17 11:11 (Africa/Johannesburg)

## Backup Artifacts

- `/Users/carlodebruin/Local Sites/Alasr.co.za/components/forms/ApplicationForm.tsx.bak-20260317-1111`
- `/Users/carlodebruin/Local Sites/Alasr.co.za/public/api/applications.php.bak-20260317-1111`

## Restore Commands

Run from project root (`/Users/carlodebruin/Local Sites/Alasr.co.za`):

```bash
cp "/Users/carlodebruin/Local Sites/Alasr.co.za/components/forms/ApplicationForm.tsx.bak-20260317-1111" "/Users/carlodebruin/Local Sites/Alasr.co.za/components/forms/ApplicationForm.tsx"
cp "/Users/carlodebruin/Local Sites/Alasr.co.za/public/api/applications.php.bak-20260317-1111" "/Users/carlodebruin/Local Sites/Alasr.co.za/public/api/applications.php"
```

## Verification Commands

```bash
ls -l "/Users/carlodebruin/Local Sites/Alasr.co.za/components/forms/ApplicationForm.tsx" "/Users/carlodebruin/Local Sites/Alasr.co.za/components/forms/ApplicationForm.tsx.bak-20260317-1111"
ls -l "/Users/carlodebruin/Local Sites/Alasr.co.za/public/api/applications.php" "/Users/carlodebruin/Local Sites/Alasr.co.za/public/api/applications.php.bak-20260317-1111"
```