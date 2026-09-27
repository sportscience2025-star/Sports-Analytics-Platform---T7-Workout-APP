import zipfile
import xml.etree.ElementTree as ET
import os

print("=== Excel File Structure & Security Audit ===")
excel_file = "../test_data/program_test.xlsx"

if not os.path.exists(excel_file):
    print(f"[ERROR] Excel file {excel_file} does not exist!")
    exit(1)

try:
    # 1. Test zip integrity
    with zipfile.ZipFile(excel_file, 'r') as z:
        print("[OK] Success: File is a valid ZIP archive (OpenXML format).")
        
        # List files in the zip
        namelist = z.namelist()
        print(f"Total files in zip package: {len(namelist)}")
        
        # 2. Parse workbook.xml to check sheet names
        workbook_xml_path = 'xl/workbook.xml'
        if workbook_xml_path not in namelist:
            print(f"[ERROR] {workbook_xml_path} missing in package!")
            exit(1)
            
        with z.open(workbook_xml_path) as f:
            tree = ET.parse(f)
            root = tree.getroot()
            
            # OpenXML namespaces
            namespaces = {
                'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
            }
            
            sheets = []
            for sheet in root.findall('.//main:sheet', namespaces):
                name = sheet.attrib.get('name')
                sheets.append(name)
                
            print("[OK] Found sheets in workbook:")
            for s in sheets:
                print(f"   - '{s}' (Length: {len(s)})")
                
            # Verify the sheets are as expected
            expected_sheets = ["Info Generali", "Timeline", "Spiegazioni Tecniche"]
            for s in expected_sheets:
                if s not in sheets:
                    print(f"[ERROR] Expected sheet '{s}' is missing!")
                    exit(1)
            print("[OK] Success: All standard sheets are present.")
            
            # 3. Check for sheet protection (locked cells) in all worksheets
            print("\nChecking sheet protection and cell lock status...")
            protection_found = False
            worksheet_files = [name for name in namelist if name.startswith('xl/worksheets/sheet') and name.endswith('.xml')]
            
            for ws_file in worksheet_files:
                with z.open(ws_file) as f_ws:
                    ws_content = f_ws.read().decode('utf-8')
                    if '<sheetProtection' in ws_content or 'sheetProtection' in ws_content:
                        print(f"[WARN] Warning: Sheet protection element found in {ws_file}!")
                        protection_found = True
                    else:
                        print(f"   - {ws_file}: No protection found (unlocked & editable)")
                        
            if not protection_found:
                print("[OK] Success: All worksheets are fully unlocked and editable (no <sheetProtection> tags).")
            else:
                print("[ERROR] Some sheets are locked!")
                exit(1)
                
    print("\n=== Audit Completed Successfully: 0 warnings, 0 errors ===")
    exit(0)
    
except zipfile.BadZipFile:
    print("[ERROR] File is not a valid zip archive (corrupt or invalid format)!")
    exit(1)
except Exception as e:
    # Use ASCII error representation to avoid nested print exception
    print(f"[ERROR] Error during verification: {str(e).encode('ascii', 'ignore').decode('ascii')}")
    exit(1)
