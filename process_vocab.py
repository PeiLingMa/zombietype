import json
import re
import os

# create_example_files 和 get_description_parts 函數保持不變...
def create_example_files():
    """Creates example data.json (nested) and matched_amend_items.json for testing."""
    original_data_content = {
        "author": "AI_Test_Strict",
        "version": "1.0",
        "topics": {
            "animals": {
                "easy": [
                    {
                        "description": "Protecting (animal) habitats is important.",
                        "answer": "animal",
                        "type": "amend",
                        "id": "animal_q1" # Original ID
                    },
                    {
                        "description": "Try to swat those annoying (flies).",
                        "answer": "flies",
                        "type": "amend",
                        "id": "flies_q1"
                    },
                    {
                        "description": "This (animal) is cute.", # Different context
                        "answer": "animal",
                        "type": "amend",
                        "id": "animal_q2_diff_text"
                    },
                    { # Item that should remain (no match in modified by context)
                        "description": "A cat says (meow).",
                        "answer": "meow",
                        "type": "amend",
                        "id": "cat_q1"
                    }
                ],
                "medium": [
                    {
                        "description": "The bird preened its (feathers).",
                        "answer": "feathers",
                        "type": "amend",
                        "id": "feathers_q1"
                    },
                    { # Duplicate original item for testing pool consumption
                        "description": "The bird preened its (feathers).",
                        "answer": "feathers",
                        "type": "amend",
                        "id": "feathers_q1_dup"
                    }
                ]
            },
            "food": {
                "easy": [
                    {
                        "description": "I like to eat (apple).",
                        "answer": "apple",
                        "type": "amend",
                        "id": "apple_q1" # This one won't have a replacement in matched_items
                    }
                ]
            }
        }
    }
    with open("data.json", "w", encoding='utf-8') as f:
        json.dump(original_data_content, f, ensure_ascii=False, indent=2)
    print("Created example 'data.json'")

    matched_items_content = [
        { # Will be used for animal_q1
            "description": "Protecting (anemal) habitats is important.",
            "answer": "animal",
            "type": "amend",
            "id": "MOD_animal_q1" # Modified ID
        },
        { # Will be used for flies_q1
            "description": "Try to swat those annoying (flys).",
            "answer": "flies",
            "type": "amend",
            "id": "MOD_flies_q1"
        },
        { # Will be used for feathers_q1
            "description": "The bird preened its (feathesr).",
            "answer": "feathers",
            "type": "amend",
            "id": "MOD_feathers_q1"
        },
        { # Will be used for feathers_q1_dup
            "description": "The bird preened its (fethers).",
            "answer": "feathers",
            "type": "amend",
            "id": "MOD_feathers_q1_dup"
        },
        { # Unused: context different from animal_q2_diff_text
            "description": "That specific (anmal) is interesting.",
            "answer": "animal",
            "type": "amend",
            "id": "MOD_animal_unused_context"
        },
        { # Unused: no matching original item for "banana"
            "description": "This is a (banana) test.",
            "answer": "banana",
            "type": "amend",
            "id": "MOD_banana_unused"
        },
        { # Unused: no id, malformed desc for context
            "description": "Malformed (test no closing paren",
            "answer": "test",
            "type": "amend"
            # No ID
        },
        { # Unused: no answer
            "description": "No answer (here).",
            "type": "amend",
            "id": "MOD_no_answer_unused"
        }
    ]
    with open("matched_amend_items.json", "w", encoding='utf-8') as f:
        json.dump(matched_items_content, f, ensure_ascii=False, indent=2)
    print("Created example 'matched_amend_items.json'")


def get_description_parts(description_string):
    match = re.search(r'(.*)\((.*?)\)(.*)', description_string)
    if match:
        return match.group(1).strip(), match.group(2).strip(), match.group(3).strip()
    return None, None, None

total_replacements_made = 0

# find_and_replace_in_node now takes a set of (original_index_in_modified_list) for used items
def find_and_replace_in_node(current_node, modifications_pool_by_answer_and_context, used_modified_item_indices):
    global total_replacements_made

    if isinstance(current_node, list):
        for i in range(len(current_node)):
            original_item = current_node[i]
            if isinstance(original_item, dict) and original_item.get("type") == "amend":
                original_desc = original_item.get("description", "")
                original_answer = original_item.get("answer")

                if original_answer:
                    original_before, original_in_paren, original_after = get_description_parts(original_desc)
                    if original_in_paren is not None and original_in_paren == original_answer:
                        original_context_key_part1 = ' '.join(original_before.split())
                        original_context_key_part3 = ' '.join(original_after.split())
                        context_key = (original_answer, original_context_key_part1, original_context_key_part3)
                        
                        if context_key in modifications_pool_by_answer_and_context and modifications_pool_by_answer_and_context[context_key]:
                            # replacement_item is now a tuple: (item_object, original_index_in_modified_list)
                            replacement_item_obj, original_idx = modifications_pool_by_answer_and_context[context_key].pop(0)
                            current_node[i] = replacement_item_obj
                            used_modified_item_indices.add(original_idx) # Mark by original index
                            total_replacements_made += 1
                            continue
            
            if isinstance(current_node[i], (dict, list)):
                find_and_replace_in_node(current_node[i], modifications_pool_by_answer_and_context, used_modified_item_indices)

    elif isinstance(current_node, dict):
        for key, value in list(current_node.items()):
            if isinstance(value, dict) and value.get("type") == "amend":
                original_item = value
                original_desc = original_item.get("description", "")
                original_answer = original_item.get("answer")

                if original_answer:
                    original_before, original_in_paren, original_after = get_description_parts(original_desc)
                    if original_in_paren is not None and original_in_paren == original_answer:
                        original_context_key_part1 = ' '.join(original_before.split())
                        original_context_key_part3 = ' '.join(original_after.split())
                        context_key = (original_answer, original_context_key_part1, original_context_key_part3)

                        if context_key in modifications_pool_by_answer_and_context and modifications_pool_by_answer_and_context[context_key]:
                            replacement_item_obj, original_idx = modifications_pool_by_answer_and_context[context_key].pop(0)
                            current_node[key] = replacement_item_obj
                            used_modified_item_indices.add(original_idx)
                            total_replacements_made += 1
                            continue
            
            if isinstance(value, (dict, list)):
                find_and_replace_in_node(value, modifications_pool_by_answer_and_context, used_modified_item_indices)

def main_update_process(original_data_filepath="data.json", modified_items_filepath="matched_amend_items.json"):
    global total_replacements_made
    total_replacements_made = 0

    try:
        with open(original_data_filepath, 'r', encoding='utf-8') as f:
            original_data_structure = json.load(f)
    except FileNotFoundError:
        print(f"Error: Original data file '{original_data_filepath}' not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{original_data_filepath}'.")
        return
    except Exception as e:
        print(f"An unexpected error occurred while reading '{original_data_filepath}': {e}")
        return

    try:
        with open(modified_items_filepath, 'r', encoding='utf-8') as f:
            # Keep a direct reference to the loaded list for accurate "unused" reporting
            raw_modified_items_list = json.load(f)
    except FileNotFoundError:
        print(f"Error: Modified items file '{modified_items_filepath}' not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{modified_items_filepath}'.")
        return
    except Exception as e:
        print(f"An unexpected error occurred while reading '{modified_items_filepath}': {e}")
        return

    if not isinstance(raw_modified_items_list, list):
        print(f"Error: Content of '{modified_items_filepath}' is not a JSON list.")
        return

    modifications_pool_by_answer_and_context = {}
    
    # Store items in the pool along with their original index in raw_modified_items_list
    for index, mod_item in enumerate(raw_modified_items_list):
        mod_answer = mod_item.get('answer')
        mod_desc = mod_item.get('description', "")
        
        if mod_answer is not None:
            mod_before, _, mod_after = get_description_parts(mod_desc)
            if mod_before is not None and mod_after is not None: # Valid context
                mod_context_key_part1 = ' '.join(mod_before.split())
                mod_context_key_part3 = ' '.join(mod_after.split())
                context_key = (mod_answer, mod_context_key_part1, mod_context_key_part3)
                # Store a tuple: (item_object, original_index)
                modifications_pool_by_answer_and_context.setdefault(context_key, []).append((mod_item, index))
            # else: item has malformed description, won't be added to pool for context matching
        # else: item lacks answer, won't be added to pool

    used_modified_item_indices = set() # Keep track of original indices of modified items that were used

    find_and_replace_in_node(original_data_structure, modifications_pool_by_answer_and_context, used_modified_item_indices)

    try:
        with open(original_data_filepath, 'w', encoding='utf-8') as f:
            json.dump(original_data_structure, f, ensure_ascii=False, indent=2)
        print(f"\nSuccessfully updated '{original_data_filepath}'.")
        print(f"Total objects replaced: {total_replacements_made}")
        
        # Identify and list unused modified items by checking their original indices
        unused_count = 0
        unused_items_details = []
        for index, item_from_raw_list in enumerate(raw_modified_items_list):
            if index not in used_modified_item_indices:
                unused_count += 1
                item_id_str = item_from_raw_list.get('id', f"Index_{index}") # Use ID or index
                item_desc_preview = item_from_raw_list.get('description', 'N/A')[:50] + "..."
                item_answer = item_from_raw_list.get('answer', 'N/A')
                unused_items_details.append(f"  - ID/Index: {item_id_str}, Description (preview): \"{item_desc_preview}\", Answer: \"{item_answer}\"")

        if unused_count > 0:
            print(f"\n{unused_count} item(s) from '{modified_items_filepath}' were not used for replacement:")
            for detail in unused_items_details:
                print(detail)
        else:
            print(f"All items from '{modified_items_filepath}' were considered for replacement (either used or not eligible for pooling).")

    except Exception as e:
        print(f"An error occurred while writing updated data to '{original_data_filepath}': {e}")

if __name__ == "__main__":
    if not os.path.exists("data.json") or not os.path.exists("matched_amend_items.json"):
        print("One or both example files not found. Creating them for testing...")
        create_example_files()
        print("-" * 30)
    
    main_update_process()