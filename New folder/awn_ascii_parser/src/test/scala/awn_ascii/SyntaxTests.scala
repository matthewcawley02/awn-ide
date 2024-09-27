package awn
package tests

import org.bitbucket.inkytonik.kiama.util.TestCompiler
import AWN_ASCIISyntax.{ASTNode, AWN_ASCII_BNF}

/**
 * Tests that check that the .
 */
class AWNTests extends Driver with TestCompiler[ASTNode, AWN_ASCII_BNF] {

    val path = "src/test/resources/parser"
    filetests("AWN", path, ".awn", ".out")

}
