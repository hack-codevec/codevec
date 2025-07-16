import apiClient from "@/lib/api-client";
import { Project } from "@/types/project";
import { createClient } from "@/utils/supabase/client";

export const getProjects = async (): Promise<Project[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("project").select("*");

    if (error) {
      throw new Error("Failed to load projects");
    }

    console.log(data);

    return data as Project[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export async function addProject(gitHubUrl: string, projectName: string) : Promise<{ project?: Project; error?: Error }> {
  try {
    const isExist = await checkGithubRepo(gitHubUrl);
    if (!isExist) {
      throw new Error("Git hub url doesnot exists.");
    }

    const response = await apiClient.post("/v1/new/project", { gitHubUrl, projectName })

    if(response.status == 200){
      const project = response.data.project[0] as Project;
      return {project};
    }
    else{
      throw Error("Error encountered while creating the project.")
    }
  } catch (_error) {
    if(_error instanceof Error){
      return { error: _error};
    }
    return { error: Error("Unknown error occured") };
  }
}

export async function checkGithubRepo(basePath: string): Promise<boolean> {
  try {
    const match = basePath.match(/^([\w.-]+)\/([\w.-]+)$/);
    if (!match) {
      return false;
    }

    const apiUrl = `https://api.github.com/repos/${basePath}`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking GitHub repo:", error);
    return false;
  }
}
