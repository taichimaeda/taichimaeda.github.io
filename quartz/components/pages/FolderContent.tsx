import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import path from "path"

import style from "../styles/listPage.scss"
import { PageList } from "../PageList"
import { stripSlashes, simplifySlug, FullSlug } from "../../util/path"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { QuartzPluginData } from "../../plugins/vfile"

interface FolderContentOptions {
  /**
   * Whether to display number of folders
   */
  showFolderCount: boolean
}

const defaultOptions: FolderContentOptions = {
  showFolderCount: true,
}

export default ((opts?: Partial<FolderContentOptions>) => {
  const options: FolderContentOptions = { ...defaultOptions, ...opts }

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props

    // Collect all pages in the current folder.
    const folderSlug = stripSlashes(simplifySlug(fileData.slug!))
    const allPagesInFolder = allFiles.filter((file) => {
      const fileSlug = stripSlashes(simplifySlug(file.slug!))
      const prefixed = fileSlug.startsWith(folderSlug) && fileSlug !== folderSlug
      const folderParts = folderSlug.split(path.posix.sep)
      const fileParts = fileSlug.split(path.posix.sep)
      const isDirectChild = fileParts.length === folderParts.length + 1
      return prefixed && isDirectChild
    })

    // Collect all subfolders in the current folder.
    const allSubfoldersInFolder: Record<string, Partial<QuartzPluginData>> = {};
    allFiles.forEach((file) => {
      const fileSlug = stripSlashes(simplifySlug(file.slug!))
      const prefixed = fileSlug.startsWith(folderSlug) && fileSlug !== folderSlug
      const folderParts = folderSlug.split(path.posix.sep)
      const fileParts = fileSlug.split(path.posix.sep)
      const isIndirectChild = fileParts.length > folderParts.length + 1
      if (!prefixed || !isIndirectChild) { 
        return;
      }
      const subfolderSlug = fileParts.slice(0, folderParts.length + 1).join(path.posix.sep)
      const subfolderName = fileParts[folderParts.length]
      const fileDates = file.dates;
      const subfolderDates = allSubfoldersInFolder[subfolderSlug]?.dates;
      function laterDate(date1?: Date, date2?: Date): Date {
        return new Date(Math.max(date1?.getTime() ?? 0, date2?.getTime() ?? 0))
      } 
      allSubfoldersInFolder[subfolderSlug] = {
        slug: subfolderSlug as FullSlug,
        frontmatter: {
          title: `Folder: ${subfolderName}`,
          tags: [],
        },
        dates: {
          created: laterDate(fileDates?.created, subfolderDates?.created),
          modified: laterDate(fileDates?.modified, subfolderDates?.modified),
          published: laterDate(fileDates?.published, subfolderDates?.published),
        }
      }
    })

    const allEntriesInFolder = [...allPagesInFolder, ...Object.values(allSubfoldersInFolder)]

    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = ["popover-hint", ...cssClasses].join(" ")
    const listProps = {
      ...props,
      allFiles: allEntriesInFolder,
    }

    const content =
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)

    return (
      <div class={classes}>
        <article>{content}</article>
        <div class="page-listing">
          {options.showFolderCount && (
            <p>
              {i18n(cfg.locale).pages.folderContent.itemsUnderFolder({
                count: allEntriesInFolder.length,
              })}
            </p>
          )}
          <div>
            <PageList {...listProps} />
          </div>
        </div>
      </div>
    )
  }

  FolderContent.css = style + PageList.css
  return FolderContent
}) satisfies QuartzComponentConstructor
