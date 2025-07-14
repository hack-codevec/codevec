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

export async function addProject(githuburl: string, projectName: string) {
  try {
    const isExist = await checkGithubRepo(githuburl);
    if (!isExist) {
      throw new Error("Git hub url doesnot exists.");
    }
    const supabase = createClient();
    const { data: authUser, error: userError } = await supabase.auth.getUser();

    if(userError){
      throw new Error("User not found");
    }

    if(authUser.user){

      const { data, error } = await supabase
      .from("project")
      .insert({
        base_git_url: githuburl,
        name: projectName,
        user_id: authUser.user.id
      })
      .select()
      .single();
      
      if (error || !data) {
        throw new Error(error?.message || "Failed to insert project");
      }
      return data;
    }else{
      throw new Error("User not found");
    }
  } catch (_error) {
    return [];
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
