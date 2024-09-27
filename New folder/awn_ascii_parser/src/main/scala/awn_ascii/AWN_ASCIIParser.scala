package awn

/* it's the same as in test.scala.Main - should at least be unified */
import awn.{AWN_ASCII, AWN_ASCIIPrettyPrinter} //, AWN_ASCIISyntax
import awn.AWN_ASCIISyntax.{ASTNode, AWN_ASCII_BNF}
import org.bitbucket.inkytonik.kiama.util.{CompilerBase, Config}

class AWN_ASCIIParser extends CompilerBase[ASTNode, AWN_ASCII_BNF, Config] {

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

    def process(source : Source, ast : AWN_ASCII_BNF, config : Config) : Unit = {
        AWN_ASCIIPrettyPrinter.format(ast, 5)
    }

    def format(ast : AWN_ASCII_BNF) : Document =
        AWN_ASCIIPrettyPrinter.format(ast, 5)

}
