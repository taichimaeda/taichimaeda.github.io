import fs from "fs"
import DepGraph from "../../depgraph"
import { FilePath, QUARTZ, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"

export const HomePage: QuartzEmitterPlugin = () => ({
  name: "Static",
  getQuartzComponents() {
    return []
  },
  async getDependencyGraph({ argv }, _content, _resources) {
    const graph = new DepGraph<FilePath>()

    const staticPath = joinSegments(QUARTZ, "static")
    const fp = joinSegments(staticPath, "index.html")
    graph.addEdge(
      joinSegments("static", fp) as FilePath,
      joinSegments(argv.output, "static", fp) as FilePath,
    )

    return graph
  },
  async emit({ argv }, _content, _resources): Promise<FilePath[]> {
    const staticPath = joinSegments(QUARTZ, "static")
    const fp = joinSegments(staticPath, "index.html")
    await fs.promises.cp(fp, joinSegments(argv.output, "index.html"), {
      recursive: true,
      dereference: true,
    })
    return [joinSegments(argv.output, "index.html")] as FilePath[]
  },
})
