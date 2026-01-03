import os

def create_pdf(filename, content_text):
    # Minimal PDF structure
    # Objects:
    # 1: Catalog
    # 2: Page Tree
    # 3: Page
    # 4: Content Stream (Text)
    # 5: Font
    
    # We need to calculate byte offsets for XREF
    
    pdf_content = []
    
    # Header
    header = b"%PDF-1.1\n"
    pdf_content.append(header)
    
    # Body
    obj1_offset = len(b"".join(pdf_content))
    obj1 = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    pdf_content.append(obj1)
    
    obj2_offset = len(b"".join(pdf_content))
    obj2 = b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    pdf_content.append(obj2)
    
    obj3_offset = len(b"".join(pdf_content))
    # Reference Font object (5 0 R)
    obj3 = b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n"
    pdf_content.append(obj3)
    
    # Text Stream
    stream_content = f"BT /F1 24 Tf 50 700 Td ({content_text}) Tj ET".encode('latin1')
    stream_length = len(stream_content)
    
    obj4_offset = len(b"".join(pdf_content))
    obj4 = f"4 0 obj\n<< /Length {stream_length} >>\nstream\n".encode('latin1') + stream_content + b"\nendstream\nendobj\n"
    pdf_content.append(obj4)
    
    obj5_offset = len(b"".join(pdf_content))
    obj5 = b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
    pdf_content.append(obj5)
    
    # XREF
    xref_offset = len(b"".join(pdf_content))
    xref = b"xref\n0 6\n0000000000 65535 f \n"
    xref += f"{obj1_offset:010} 00000 n \n".encode('latin1')
    xref += f"{obj2_offset:010} 00000 n \n".encode('latin1')
    xref += f"{obj3_offset:010} 00000 n \n".encode('latin1')
    xref += f"{obj4_offset:010} 00000 n \n".encode('latin1')
    xref += f"{obj5_offset:010} 00000 n \n".encode('latin1')
    pdf_content.append(xref)
    
    # Trailer
    trailer = f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF".encode('latin1')
    pdf_content.append(trailer)
    
    with open(filename, 'wb') as f:
        f.write(b"".join(pdf_content))
    print(f"Created {filename}")

if __name__ == "__main__":
    create_pdf("invoice_sample.pdf", "INVOICE #INV-2026-001 - Amount: $12,500.00")
    create_pdf("packing_list_sample.pdf", "PACKING LIST #PL-9988 - Items: 5000 Units")
    create_pdf("error_invoice.pdf", "ERROR INVOICE - Discrepancy Expected")
