{
  inputs = {};
  outputs = {nixpkgs, ...}: let
    pkgs = nixpkgs.legacyPackages.riscv64-linux;
  in {
    packages.riscv64-linux.default = builtins.toFile
      "hello-world"
      "Hello world!";
  };
}