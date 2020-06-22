#! coding: utf-8
# pylint: disable-msg=W0311

import fabric

# Define sets of servers as roles
fabric.api.env.roledefs = {
  'web' : ['103.56.156.161']
}

fabric.api.env.user = 'root'
fabric.api.env.warn_only = True

@fabric.api.roles('web')
def deploy():
  print
  print "Uploading changes..."
  print
  fabric.contrib.project.rsync_project(remote_dir='/data/data_pro/',
                                       exclude=['.hg',
                                                '.settings',
                                                'log', '*.pyc'])
  print
  print "Reloading....."
  print
  fabric.api.run('sudo supervisorctl -c /data/data_pro/apec/src/supervisord.conf stop all')
  fabric.api.run('sudo supervisorctl -c /data/data_pro/apec/src/supervisord.conf reload')

