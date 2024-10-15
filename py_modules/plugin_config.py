import os
from pathlib import Path
import decky
import json

class PluginConfig:
    package_json_file = Path(decky.DECKY_PLUGIN_DIR) / "package.json"
    config_dir = Path(decky.DECKY_PLUGIN_SETTINGS_DIR)
    cfg_property_file = config_dir / "plugin.json"

    @staticmethod
    def convert_value(value):
        if isinstance(value, str):
            if value.lower() == "true":
                return True
            elif value.lower() == "false":
                return False
            try:
                return int(value)
            except ValueError:
                try:
                    return float(value)
                except ValueError:
                    return value
        return value

    @staticmethod
    def flatten_json(nested_json, parent_key=''):
        items = {}
        for key, value in nested_json.items():
            new_key = parent_key + '.' + key if parent_key else key
            if isinstance(value, dict):
                # Recursión si el valor es otro diccionario
                items.update(PluginConfig.flatten_json(value, new_key))
            else:
                items[new_key] = value
        return items

    @staticmethod
    def get_config(): 
        with open(PluginConfig.cfg_property_file, "r") as jsonFile:
            config_data = json.load(jsonFile)

        flat_config = {}

        stack = [(config_data, '')]
        while stack:
            current, parent_key = stack.pop()

            for key, value in current.items():
                new_key = parent_key + '.' + key if parent_key else key

                if isinstance(value, dict) and value:
                    stack.append((value, new_key))
                else:
                    flat_config[new_key] = value

        return flat_config

    @staticmethod
    def set_config(key: str, value):
        value = PluginConfig.convert_value(value)
        with open(PluginConfig.cfg_property_file, "r+") as jsonFile:
            data = json.load(jsonFile)
            
            keys = key.split(".")
            d = data
            
            for k in keys[:-1]:
                if k not in d:
                    d[k] = {}
                d = d[k]
            
            d[keys[-1]] = value

            jsonFile.seek(0)
            json.dump(data, jsonFile, indent=4)
            jsonFile.truncate()

    @staticmethod
    def delete_config(key: str):
        with open(PluginConfig.cfg_property_file, "r+") as jsonFile:
            data = json.load(jsonFile)
            
            keys = key.split(".")
            d = data
            
            for k in keys[:-1]:
                if k not in d:
                    print(f"Key '{key}' does not exist.")
                    return
                d = d[k]
            
            if keys[-1] in d:
                del d[keys[-1]]
                print(f"Key '{key}' has been deleted.")
            else:
                print(f"Key '{key}' does not exist.")

            jsonFile.seek(0)
            json.dump(data, jsonFile, indent=4)
            jsonFile.truncate()

    @staticmethod
    def get_config_item(name: str, default: str = None):
        with open(PluginConfig.cfg_property_file, "r") as jsonFile:
            data = json.load(jsonFile)
            
            keys = name.split(".")
            d = data
            
            for k in keys:
                if k in d:
                    d = d[k]
                else:
                    return default
            
            return d

    @staticmethod
    def migrate():
        if not PluginConfig.config_dir.is_dir():
            os.makedirs(PluginConfig.config_dir, exist_ok=True)
        if not PluginConfig.cfg_property_file.is_file():
            PluginConfig.cfg_property_file.touch()
            dictionary = {
                "log_level": "INFO",
                "entries": {},
                "settings":{
                    "remote":{}
                }
            }
            json_object = json.dumps(dictionary, indent=4)
            with open(PluginConfig.cfg_property_file, "w") as outfile:
                outfile.write(json_object)

    @staticmethod
    def get_git_data():
        package_json_data={}
        with open(PluginConfig.package_json_file, 'r', encoding='utf-8') as file:
            package_json_data = json.load(file)
        
        return {
            "repoUrl":     f"https://github.com/{package_json_data['author']}/{decky.DECKY_PLUGIN_NAME}",
            "issuesUrl":   f"https://github.com/{package_json_data['author']}/{decky.DECKY_PLUGIN_NAME}/issues",
            "releasesUrl": f"http://api.github.com/repos/{package_json_data['author']}/{decky.DECKY_PLUGIN_NAME}/releases/latest"
        }
        