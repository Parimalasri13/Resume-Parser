# import json
# import os
# import re

# # 1. Read the JSON file
# with open("C:/Users/sikha/OneDrive/Desktop/Resume-Parser/backend/resumes.json", "r", encoding="utf-8") as f:
#     raw_string = f.read()

# # 2. Convert string to a list of lists of dicts
# data = json.loads(raw_string)

# # 3. Create output folder
# output_dir = "resumes_by_name"
# os.makedirs(output_dir, exist_ok=True)

# # 4. Process and save each resume
# for resume_array in data:
#     if not resume_array or not isinstance(resume_array, list):
#         continue

#     resume = resume_array[0]  # Each inner list has one dictionary

#     name = resume.get("Name of the person", "Unknown")
#     safe_name = re.sub(r'[^\w\s-]', '', name).strip().replace(" ", "_")
#     filename = f"{safe_name}.json"
#     filepath = os.path.join(output_dir, filename)

#     with open(filepath, "w", encoding="utf-8") as f:
#         json.dump(resume, f, indent=4, ensure_ascii=False)

#     print(f"Saved resume for: {name} → {filename}")

# print(" All resumes saved by name.")


# import json
# import os
# import re

# # 1. Read the JSON file
# with open("C:/Users/sikha/OneDrive/Desktop/Resume-Parser/backend/resumes.json", "r", encoding="utf-8") as f:
#     raw_string = f.read()

# # 2. Convert string to a list of lists of dicts
# data = json.loads(raw_string)

# # 3. Create output folder
# output_dir = "resumes_by_name"
# os.makedirs(output_dir, exist_ok=True)

# # 4. Process and save each resume
# for resume_array in data:
#     if not resume_array or not isinstance(resume_array, list):
#         continue

#     resume = resume_array[0]  # Each inner list has one dictionary

#     name = resume.get("Name of the person", "Unknown")
#     safe_name = re.sub(r'[^\w\s-]', '', name).strip().replace(" ", "_")
#     filename = f"{safe_name}.json"
#     filepath = os.path.join(output_dir, filename)

#     with open(filepath, "w", encoding="utf-8") as f:
#         json.dump(resume, f, indent=4, ensure_ascii=False)

#     print(f" Saved resume for: {name} → {filename}")

# print(" All resumes saved by name.")





# import json
# import os
# import re

# with open("C:/Users/sikha/OneDrive/Desktop/Resume-Parser/backend/resumes.json", "r", encoding="utf-8") as f:
#     data = json.load(f)

# # Try to normalize data structure
# if isinstance(data, list) and all(isinstance(i, list) for i in data):
#     data = [i[0] for i in data if i]  # Flatten if it's list of lists

# output_dir = os.path.expanduser("~/Desktop/resumes_by_name")
# os.makedirs(output_dir, exist_ok=True)

# for resume in data:
#     if not isinstance(resume, dict):
#         continue

#     name = resume.get("Name of the person", "Unknown")
#     safe_name = re.sub(r'[^\w\s-]', '', name).strip().replace(" ", "_")
#     filename = f"{safe_name}.json"
#     filepath = os.path.join(output_dir, filename)

#     with open(filepath, "w", encoding="utf-8") as f:
#         json.dump(resume, f, indent=4, ensure_ascii=False)

#     print(f"Saved resume for: {name} → {filename}")

# print("All resumes saved by name.")





import json

# Step 1: Load the raw string
with open("your_file.json", "r", encoding="utf-8") as f:
    raw_data = f.read()

# Step 2: Decode the outer JSON string
decoded_data = json.loads(raw_data)

# Step 3: Now pretty-print or re-save
with open("formatted.json", "w", encoding="utf-8") as f:
    json.dump(decoded_data, f, indent=4, ensure_ascii=False)
