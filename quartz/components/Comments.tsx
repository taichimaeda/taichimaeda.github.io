import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  return ({ fileData }: QuartzComponentProps) => {
    const comments = fileData.frontmatter?.comments !== "disable"
    if (!comments) {
      return null;
    }

    return (
      <>
        <hr />
        <script
          src="https://utteranc.es/client.js"
          // @ts-ignore
          repo="taichimaeda/taichimaeda.github.io"
          issue-term="pathname"
          theme="github-dark"
          crossorigin="anonymous"
          async
        />
      </>
    )
  }
}) satisfies QuartzComponentConstructor
