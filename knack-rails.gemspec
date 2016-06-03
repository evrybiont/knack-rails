# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'knack-rails/version'

Gem::Specification.new do |spec|
  spec.name          = "knack-rails"
  spec.version       = KnackRails::VERSION
  spec.authors       = ["evrybiont"]
  spec.email         = ["evrybiont@gmail.com"]

  spec.summary       = %q{Jquery plugin}
  spec.description   = %q{Responsive Image Gallery}
  spec.homepage      = "https://github.com/evrybiont/knack-rails"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.10"
  spec.add_development_dependency "rake", "~> 10.0"
end
