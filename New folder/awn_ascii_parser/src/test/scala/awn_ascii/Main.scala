package awn
package tests

import awn.AWN_ASCIISyntax.{ASTNode, AWN_ASCII_BNF}
import org.bitbucket.inkytonik.kiama.util.{CompilerBase, Config}

class Driver extends CompilerBase[ASTNode, AWN_ASCII_BNF, Config] {
    import org.bitbucket.inkytonik.kiama.output.PrettyPrinterTypes.Document
    import org.bitbucket.inkytonik.kiama.util.{Config, Source}
    import org.bitbucket.inkytonik.kiama.util.Messaging.Messages

    val name = "awn ascii"

    def createConfig(args : Seq[String]) : Config =
        new Config(args)

    //  build an AST from a Source if possible
    override def makeast(source : Source, config : Config) : Either[AWN_ASCII_BNF, Messages] = {
        val p = new AWN_ASCII(source, positions)
        val pr = p.pAWN_ASCII_BNF(0)
        if (pr.hasValue)
            Left(p.value(pr).asInstanceOf[AWN_ASCII_BNF])
        else
            Right(Vector(p.errorToMessage(pr.parseError)))
    }

    //  to be done later (maybe not needed as only parsing is required)
    def process(source : Source, ast : AWN_ASCII_BNF, config : Config) : Unit = {
        config.output().emitln(ast)
    }

    def format(ast : AWN_ASCII_BNF) : Document =
        AWN_ASCIIPrettyPrinter.format(ast, 5)
}

object Main extends Driver