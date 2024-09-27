package awn

import AWN_ASCIISyntax.AWN_ASCII_BNF
import awn.AWN_ASCIIParser
import org.bitbucket.inkytonik.kiama.util.Source

object FileParser {

    import scala.util.{Failure, Success, Try}

    def parseFile(fileName : String) : Try[AWN_ASCII_BNF] = {
        parseSource(org.bitbucket.inkytonik.kiama.util.FileSource(fileName))
    }

    def parseString(input : String) : Try[AWN_ASCII_BNF] = {
        parseSource(org.bitbucket.inkytonik.kiama.util.StringSource(input))
    }

    def parseSource(input : Source) : Try[AWN_ASCII_BNF] = {
        val p = new AWN_ASCIIParser()
        p.makeast(input, p.createConfig(List())) match {
            case Left(x)  => Success(x)
            case Right(m) => Failure(new Exception(s"Parse error ${p.messaging.formatMessages(m)}"))
        }
    }
}