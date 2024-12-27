{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShellNoCC {
  packages = with pkgs; [
    (python3.withPackages (ps: [ ps.svgwrite ]))
    nodejs_23
    bun
    git
  ];

  shellHook = ''
    export TERM=xterm-256color
  '';
}
