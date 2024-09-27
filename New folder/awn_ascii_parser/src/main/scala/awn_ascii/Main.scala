package awn

//import awn.FileParser.parseString
import awn.FileParser.parseFile
import java.io.File

object Main {

    import awn.AWN_ASCIIPrettyPrinter.show
    import awn.AWN_ASCIISyntax._
    import scala.util.Try

    def main(args : Array[String]) : Unit = {
        println("hello");
        val path = "examples/" + args(0)
        //val file = path + args(0)
        //parsePrintFile(file)

        println(s"iterating through files in directory ${path}")
        val files = getListOfFiles(new File(path), List("awn"))
        for (f <- files)
            parsePrintFile(path + f.getName())
    }

    //parse and printing
    def parsePrintFile(file : String) : Unit = {
        println("")
        println("======================================")
        println(file.toUpperCase())
        println("======================================")
        val tryParse : Try[AWN_ASCII_BNF] = parseFile(file)
        println(tryParse.get)
        println(show(tryParse.get))
    }

    // get List of files with particular postfix -- to be changed to FileNames at some point.
    def getListOfFiles(dir : File, extensions : List[String]) : List[File] = {
        dir.listFiles.filter(_.isFile).toList.filter { file =>
            extensions.exists(file.getName.endsWith(_))
        }
    }

}

