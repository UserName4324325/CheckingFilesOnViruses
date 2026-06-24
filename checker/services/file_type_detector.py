import os

ALLOWED_EXTENSIONS = {
    '.doc', '.docx', '.rtf', '.odt',
    '.pdf',
    '.ppsx', '.pptx', '.ppt', '.pps', '.odp',
    '.xlsx', '.xls', '.ods'
}

def get_extension(filename):
    ext = os.path.splitext(filename)[1].lower()
    return ext

def is_allowed_extension(filename):
    ext = get_extension(filename)
    return ext in ALLOWED_EXTENSIONS