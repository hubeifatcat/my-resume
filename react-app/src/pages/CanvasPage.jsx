import Navbar from "../components/Navbar.jsx";

/**
 * 视频创作画布页：iframe 承载独立画布工作流页面（canvas-workflow.html）
 * 画布页支持：节点拖拽 / 端口连线 / 上传图片视频 / 运行演示
 */
export default function CanvasPage() {
  return (
    <div className="site v3 canvas-page">
      <Navbar />
      <div className="canvas-page-body">
        <iframe
          src={`${import.meta.env.BASE_URL}canvas-workflow.html`}
          title="视频创作画布"
          className="canvas-page-frame"
        />
      </div>
    </div>
  );
}
