function add_path --argument-names new_path
    if type -q fish_add_path
        # fish 3.2.0 or newer
	fish_add_path --prepend --global $new_path
    else
        # older versions of fish
        if not contains $new_path $fish_user_paths
            set --global fish_user_paths $new_path $fish_user_paths
        end
    end
end

# Only execute this file once per shell.
if test -n "$__ETC_PROFILE_NIX_SOURCED"
  exit
end

set __ETC_PROFILE_NIX_SOURCED 1

set --export NIX_PROFILES "/nix/var/nix/profiles/default $HOME/.nix-profile"

# Set $NIX_SSL_CERT_FILE so that Nixpkgs applications like curl work.
if test -n "$NIX_SSH_CERT_FILE"
  : # Allow users to override the NIX_SSL_CERT_FILE
else if test -e /etc/ssl/certs/ca-certificates.crt # NixOS, Ubuntu, Debian, Gentoo, Arch
  set --export NIX_SSL_CERT_FILE /etc/ssl/certs/ca-certificates.crt
else if test -e /etc/ssl/ca-bundle.pem # openSUSE Tumbleweed
  set --export NIX_SSL_CERT_FILE /etc/ssl/ca-bundle.pem
else if test -e /etc/ssl/certs/ca-bundle.crt # Old NixOS
  set --export NIX_SSL_CERT_FILE /etc/ssl/certs/ca-bundle.crt
else if test -e /etc/pki/tls/certs/ca-bundle.crt # Fedora, CentOS
  set --export NIX_SSL_CERT_FILE /etc/pki/tls/certs/ca-bundle.crt
else if test -e "$NIX_LINK/etc/ssl/certs/ca-bundle.crt" # fall back to cacert in Nix profile
  set --export NIX_SSL_CERT_FILE "$NIX_LINK/etc/ssl/certs/ca-bundle.crt"
else if test -e "$NIX_LINK/etc/ca-bundle.crt" # old cacert in Nix profile
  set --export NIX_SSL_CERT_FILE "$NIX_LINK/etc/ca-bundle.crt"
else
  # Fall back to what is in the nix profiles, favouring whatever is defined last.
  for i in $NIX_PROFILES
    if test -e "$i/etc/ssl/certs/ca-bundle.crt"
      set --export NIX_SSL_CERT_FILE "$i/etc/ssl/certs/ca-bundle.crt"
    end
  end
end

add_path "/nix/var/nix/profiles/default/bin"
add_path "$HOME/.nix-profile/bin"

functions -e add_path
