from .file_type_detector import get_extension, is_allowed_extension
from .office_checker import check_office_file
from .pdf_checker import check_pdf_file
from .rtf_checker import check_rtf_file
from .odf_checker import check_odf_file

OFFICE_EXTENSIONS = {'.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pps', '.ppsx'}
ODF_EXTENSIONS = {'.odt', '.ods', '.odp'}

def analyze_file(file):
    ext = get_extension(file.name)
    
    if ext in OFFICE_EXTENSIONS:
        result = check_office_file(file)
    elif ext == '.pdf':
        result = check_pdf_file(file)
    elif ext == '.rtf':
        result = check_rtf_file(file)
    elif ext in ODF_EXTENSIONS:
        result = check_odf_file(file)
    else:
        result = {"is_safe": True, "risk_level": "low", "details": []}
    
    details = result["details"]
    if len(details) == 0:
        risk_level = "low"
    elif len(details) <= 2:
        risk_level = "medium"
    else:
        risk_level = "high"
    
    return {
        "filename": file.name,
        "extension": ext,
        "is_safe": result["is_safe"],
        "risk_level": risk_level,
        "details": details
    }