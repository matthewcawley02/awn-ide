name := "awn_ascii_parser"
version := "0.1"

// Scala compiler settings
scalaVersion := "2.13.1"
scalacOptions :=
    Seq (
        "-deprecation",
        "-feature",
        "-sourcepath", baseDirectory.value.getAbsolutePath,
        "-unchecked",
        "-Xfatal-warnings",
        "-Xlint",
        "-Xcheckinit"
    )

scalacOptions in (Compile, doc) ++= Seq(
    "-groups",
    "-implicits",
    "-diagrams",
    "-diagrams-dot-restart",
    "50")

// Dependencies

libraryDependencies ++=
    Seq (
        "org.bitbucket.inkytonik.kiama" %% "kiama" % "2.3.0",
        "org.bitbucket.inkytonik.kiama" %% "kiama" % "2.3.0" % "test" classifier ("tests"),
        "org.bitbucket.inkytonik.kiama" %% "kiama-extras" % "2.3.0",
        "org.bitbucket.inkytonik.kiama" %% "kiama-extras" % "2.3.0" % "test" classifier ("tests"),
        "org.scalacheck" %% "scalacheck" % "1.14.3" % "test",
        "org.scalatest" %% "scalatest" % "3.1.0" % "test",
        "org.scalatestplus" %% "scalacheck-1-14" % "3.1.0.0" % "test"
    )



ratsScalaRepetitionType := Some (ListType)
ratsUseScalaOptions := true
ratsUseScalaPositions := true
ratsDefineASTClasses := true
ratsDefinePrettyPrinter := true
ratsUseDefaultComments := false
ratsUseKiama := 2

// ScalariForm

import scalariform.formatter.preferences._

scalariformPreferences := scalariformPreferences.value
    .setPreference (AlignSingleLineCaseStatements, true)
    .setPreference (IndentSpaces, 4)
    .setPreference (SpaceBeforeColon, true)
    .setPreference (SpacesAroundMultiImports, false)
