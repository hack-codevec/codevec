import MobileScreenWrapper from "@/components/mobile-screen-wrapper"
import Playground from "@/components/playground/playground" 
import Topbar from "@/components/topbar/Topbar"

type prms = {
  pid: string 
} 

type Params = Promise<prms>

export default async function IdeaDetailPage(props : { params: Params }) {
  const { pid } = await props.params 

  
  return (
    <div className="w-full h-screen flex flex-col">
      <MobileScreenWrapper project_id={ pid } />
    </div>
  ) 
}