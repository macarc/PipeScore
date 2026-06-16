{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShellNoCC {
  packages = with pkgs; [
    (python3.withPackages (ps: [ ps.svgwrite ]))
    nodejs_24
    bun
    git
  ];
}
