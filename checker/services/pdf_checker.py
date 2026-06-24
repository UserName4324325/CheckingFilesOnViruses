import fitz

def check_pdf_file(file):
    issues = []
    
    try:
        file_bytes = file.read()
        pdf = fitz.open(stream=file_bytes, filetype="pdf")
        
        for page in pdf:
            annotations = page.annots()
            if annotations:
                for annot in annotations:
                    if annot.info.get("content", ""):
                        issues.append("обнаружена подозрительная аннотация")
        
        try:
            for i in range(pdf.xref_length()):
                if pdf.xref_get_key(i, "S") == "('JavaScript')":
                    issues.append("обнаружен JavaScript в PDF")
                    break
        except:
            pass
        
        for page in pdf:
            links = page.get_links()
            for link in links:
                if link.get("uri", "").startswith("http"):
                    issues.append(f"внешняя ссылка: {link['uri']}")
        
        pdf.close()
        
    except Exception as e:
        issues.append(f"ошибка при анализе: {str(e)}")
    
    is_safe = len(issues) == 0
    risk_level = "low" if is_safe else "medium" if len(issues) < 3 else "high"
    
    return {
        "is_safe": is_safe,
        "risk_level": risk_level,
        "details": issues
    }