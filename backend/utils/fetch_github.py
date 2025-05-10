import subprocess
import os
import fnmatch

def change_permissions(path):
    for root, dirs, files in os.walk(path, topdown=False):
        for name in files:
            os.chmod(os.path.join(root, name), 0o777)  # Make files writable
        for name in dirs:
            os.chmod(os.path.join(root, name), 0o777)

def clone_repo( repo_base:str, save_dir:str):
    """
        Clone repo to required directory using the github PAT token with read only access to public repos.
        save_dir = agent/user_id/project_name/
    """
    try:
        os.makedirs(save_dir, exist_ok=True)

        auth_url = f"https://github.com/{repo_base}"
        print(f"Cloning repo from: {auth_url}")
        subprocess.run(
            ["git", "clone", auth_url, save_dir],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        change_permissions(save_dir + "/" + ".git")
        print(f"✅ Repo cloned to: {save_dir}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to clone repo: {e}")
        return False

# local_dir = f"DIRECTORY_NAME"
# repo_base = "USERNAME/REPO_NAME"
# clone_repo( repo_base = repo_base, save_dir = loacal_dir )


def get_file_tree(base_path, ignore_files=None, ignore_dirs=None):
    if ignore_files is None:
        ignore_files = [".env"]
    if ignore_dirs is None:
        ignore_dirs = [".git", "node_modules", "dist" , "__pycache__"]
  
    tree = []

    for root, dirs, files in os.walk(base_path):
        # Filter out ignored directories
        dirs[:] = [d for d in dirs if not any(fnmatch.fnmatch(d, pattern) for pattern in ignore_dirs)]

        for file_name in files:
            # Skip ignored files
            if any(fnmatch.fnmatch(file_name, pattern) for pattern in ignore_files):
                continue

            abs_file_path = os.path.join(root, file_name)
            tree.append({
                "type": "file",
                "name": file_name,
                "path": os.path.relpath(abs_file_path, base_path),
            })

        for dir_name in dirs:
            abs_dir_path = os.path.join(root, dir_name)
            tree.append({
                "type": "directory",
                "name": dir_name,
                "path": os.path.relpath(abs_dir_path, base_path)
            })

    return tree

